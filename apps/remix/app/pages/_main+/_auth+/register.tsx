import { Link } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"
import { z } from "zod"

import { sendAccountVerificationEmail } from "@ramble/api"
import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { createAction, createActions, formError } from "~/lib/form.server"
import { createToken } from "~/lib/jwt.server"
import { redirect } from "~/lib/remix.server"
import type { ActionFunctionArgs, MetaFunction } from "~/lib/vendor/vercel.server"
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
  register = "register",
}

export const action = ({ request }: ActionFunctionArgs) =>
  createActions<Actions>(request, {
    register: () =>
      createAction(request)
        .input(
          z.object({
            email: z.string().min(3).email("Invalid email"),
            username: z
              .string()
              .min(2)
              .refine((username) => !username.trim().includes(" "), "Username can not contain empty spaces"),
            password: z.string().min(8, "Must be at least 8 characters"),
            firstName: z.string().min(2, "Must be at least 2 characters"),
            lastName: z.string().min(2, "Must be at least 2 characters"),
            passwordConfirmation: z.string().optional(),
            accessCode: z.string(),
          }),
        )
        .handler(async ({ passwordConfirmation, accessCode, ...data }) => {
          if (passwordConfirmation) return redirect("/") // honey pot
          const email = data.email.toLowerCase().trim()
          const existingEmail = await db.user.findFirst({ where: { email } })
          if (existingEmail) return formError({ data, formError: "User with this email already exists" })
          const accessRequest = await db.accessRequest.findUnique({ where: { code: accessCode } })
          if (!accessRequest) return formError({ formError: "Invalid access code" })
          const username = data.username.toLowerCase().trim()
          const existingUsername = await db.user.findFirst({ where: { username } })
          if (existingUsername) return formError({ data, formError: "User with this username already exists" })
          const password = await hashPassword(data.password)
          const user = await db.user.create({
            data: { ...data, email, password, lists: { create: { name: "Favourites", description: "All my favourite spots" } } },
          })
          const { setUser } = await getUserSession(request)
          const token = await createToken({ id: user.id })
          await sendAccountVerificationEmail(user, token)
          const headers = new Headers([["set-cookie", await setUser(user.id)]])
          track("Registered", { userId: user.id })
          return redirect("/onboarding", request, {
            headers,
            flash: { title: `Welcome to Ramble, ${data.firstName}!`, description: "Let's get you setup." },
          })
        }),
  })

export default function Register() {
  return (
    <Form className="space-y-2">
      <h1 className="text-4xl font-bold">Register</h1>
      <FormField
        autoCapitalize="none"
        className="uppercase"
        required
        label="Access code"
        name="accessCode"
        placeholder="1F54AF3G"
      />
      <FormField autoCapitalize="none" required label="Email address" name="email" placeholder="jim@gmail.com" />
      <FormField required label="Password" name="password" type="password" placeholder="********" />
      <input name="passwordConfirmation" className="hidden" />
      <FormField autoCapitalize="none" required label="Choose a username" name="username" placeholder="Jim93" />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <FormField required label="First name" name="firstName" placeholder="Jim" />
        <FormField required label="Last name" name="lastName" placeholder="Bob" />
      </div>

      <div>
        <FormButton value={Actions.register} className="w-full">
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
