import { Link, useSearchParams } from "@remix-run/react"
import type { ActionFunctionArgs, MetaFunction } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import { z } from "zod"

import { generateInviteCodes, sendAccountVerificationEmail } from "@ramble/api"

import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, getFormAction, validateFormData } from "~/lib/form"
import { createToken } from "~/lib/jwt.server"
import { badRequest, redirect } from "~/lib/remix.server"
import { hashPassword } from "~/services/auth/password.server"
import { getUserSession } from "~/services/session/session.server"

export const meta: MetaFunction = () => {
  return [{ title: "Register" }, { name: "description", content: "Sign up to the ramble" }]
}
export const headers = () => {
  return {
    "Cache-Control": cacheHeader({ maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min", public: true }),
  }
}

enum Actions {
  Register = "Register",
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formAction = await getFormAction(request)

  switch (formAction) {
    case Actions.Register:
      try {
        const formData = await request.formData()
        if (formData.get("passwordConfirmation")) return redirect("/") // honey pot
        const registerSchema = z.object({
          email: z.string().min(3).email("Invalid email"),
          username: z
            .string()
            .min(2)
            .refine((username) => !username.trim().includes(" "), "Username can not contain empty spaces"),
          password: z.string().min(8, "Must be at least 8 characters"),
          firstName: z.string().min(2, "Must be at least 2 characters"),
          lastName: z.string().min(2, "Must be at least 2 characters"),
          code: z.string().min(4, "Must be at least 2 characters"),
        })
        const result = await validateFormData(request, registerSchema)
        if (!result.success) return formError(result)
        const { code, ...data } = result.data
        const email = data.email.toLowerCase().trim()
        const existingEmail = await db.user.findFirst({ where: { email } })
        if (existingEmail) return formError({ data, formError: "User with this email already exists" })
        const username = data.username.toLowerCase().trim()
        const existingUsername = await db.user.findFirst({ where: { username } })
        if (existingUsername) return formError({ data, formError: "User with this username already exists" })

        const trimmedCode = code.toUpperCase().trim()
        const inviteCode = await db.inviteCode.findFirst({ where: { code: trimmedCode, acceptedAt: null } })
        if (!inviteCode) return formError({ data, formError: "Invalid invite code" })

        const password = await hashPassword(data.password)
        const user = await db.user.create({
          data: {
            ...data,
            usedInviteCode: { connect: { id: inviteCode.id } },
            email,
            password,
            lists: { create: { name: "Favourites", description: "All my favourite spots" } },
          },
        })
        const codes = generateInviteCodes(user.id)
        await db.inviteCode.createMany({ data: codes.map((c) => ({ code: c, ownerId: user.id })) })
        await db.inviteCode.update({ where: { id: inviteCode.id }, data: { acceptedAt: new Date() } })
        const { setUser } = await getUserSession(request)
        const token = await createToken({ id: user.id })
        await sendAccountVerificationEmail(user, token)
        const headers = new Headers([["set-cookie", await setUser(user.id)]])
        track("Registered", { userId: user.id })
        return redirect("/onboarding", request, {
          headers,
          flash: { title: `Welcome to Ramble, ${data.firstName}!`, description: "Let's get you setup." },
        })
      } catch {
        return badRequest("Error registering your account")
      }

    default:
      break
  }
}

export default function Register() {
  const [searchParams] = useSearchParams()

  return (
    <Form className="space-y-2">
      <h1 className="text-4xl">Register</h1>
      <p>For now we are invite only!</p>
      <FormField required label="Invite code" placeholder="1234ABCD" name="code" defaultValue={searchParams.get("code") || ""} />
      <hr />
      <FormField autoCapitalize="none" required label="Email address" name="email" placeholder="sally@yahoo.com" />
      <FormField required label="Password" name="password" type="password" placeholder="********" />
      <input name="passwordConfirmation" className="hidden" />
      <FormField autoCapitalize="none" required label="Choose a username" name="username" placeholder="Jim93" />
      <FormField required label="First name" name="firstName" placeholder="Jim" />
      <FormField required label="Last name" name="lastName" placeholder="Bob" />

      <div>
        <FormButton value={Actions.Register} className="w-full">
          Register
        </FormButton>
        <FormError />
      </div>

      <div className="flex justify-between">
        <Link to="/login" className="hover:opacity-70">
          Login
        </Link>
        <Link to="/forgot-password" className="hover:opacity-70">
          Forgot password?
        </Link>
      </div>
    </Form>
  )
}
