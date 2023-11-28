import { Link, useSearchParams } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"
import { z } from "zod"

import { registerSchema } from "@ramble/server-schemas"
import { generateInviteCodes, hashPassword, sendSlackMessage } from "@ramble/server-services"

import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { createAction, createActions, formError } from "~/lib/form.server"
import { redirect } from "~/lib/remix.server"
import type { ActionFunctionArgs, MetaFunction } from "~/lib/vendor/vercel.server"
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
        .input(registerSchema.and(z.object({ passwordConfirmation: z.string().optional() })))
        .handler(async ({ passwordConfirmation, code, ...data }) => {
          if (passwordConfirmation) return redirect("/") // honey pot
          const existingEmail = await db.user.findFirst({ where: { email: data.email } })
          if (existingEmail) return formError({ data, formError: "User with this email already exists" })
          const existingUsername = await db.user.findFirst({ where: { username: data.username } })
          if (existingUsername) return formError({ data, formError: "User with this username already exists" })
          const inviteCode = await db.inviteCode.findFirst({ where: { code, acceptedAt: null } })
          const accessRequest = await db.accessRequest.findFirst({ where: { code, user: null } })
          if (!accessRequest && !inviteCode) return formError({ formError: "Invalid code" })
          const password = await hashPassword(data.password)
          const user = await db.user.create({
            data: {
              ...data,
              isVerified: true,
              usedInviteCode: inviteCode ? { connect: { id: inviteCode.id } } : undefined,
              password,
              lists: { create: { name: "Favourites", description: "All my favourite spots" } },
            },
          })
          if (accessRequest)
            await db.accessRequest.update({
              where: { id: accessRequest.id },
              data: { acceptedAt: new Date(), user: { connect: { id: user.id } } },
            })
          if (inviteCode)
            await db.inviteCode.update({
              where: { id: inviteCode.id },
              data: { acceptedAt: new Date(), user: { connect: { id: user.id } } },
            })

          const codes = generateInviteCodes(user.id)
          await db.inviteCode.createMany({ data: codes.map((c) => ({ code: c, ownerId: user.id })) })
          const { setUser } = await getUserSession(request)
          const headers = new Headers([["set-cookie", await setUser(user.id)]])
          track("Registered", { userId: user.id, code })
          sendSlackMessage(`🔥 @${user.username} signed up!`)
          return redirect("/onboarding", request, {
            headers,
            flash: { title: `Welcome to Ramble, ${data.firstName}!`, description: "Let's get you setup." },
          })
        }),
  })

export default function Register() {
  const [searchParams] = useSearchParams()

  return (
    <Form className="space-y-2">
      <h1 className="text-4xl font-bold">Register</h1>
      <p>For now we are invite only!</p>
      <FormField
        autoCapitalize="none"
        className="uppercase"
        required
        defaultValue={searchParams.get("code") || ""}
        label="Invite code"
        name="code"
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
