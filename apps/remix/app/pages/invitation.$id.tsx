import { useLoaderData } from "@remix-run/react"
import { z } from "zod"

import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { createAction, createActions, formError } from "~/lib/form.server"
import { json, redirect } from "~/lib/remix.server"
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "~/lib/vendor/vercel.server"
import { hashPassword } from "~/services/auth/password.server"
import { getUserSession } from "~/services/session/session.server"

export const meta: MetaFunction = () => {
  return [{ title: "Invite to beta" }, { name: "description", content: "Join the Ramble beta" }]
}

enum Actions {
  join = "join",
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const accessRequest = await db.accessRequest.findFirst({ where: { id: params.id } })
  if (!accessRequest) return redirect("/")
  return json({ email: accessRequest.email })
}

export const action = ({ request, params }: ActionFunctionArgs) =>
  createActions<Actions>(request, {
    join: () =>
      createAction(request)
        .input(
          z.object({
            email: z.string().min(3).email("Invalid email").toLowerCase().trim(),
            username: z
              .string()
              .min(2)
              .refine((username) => !username.trim().includes(" "), "Username can not contain empty spaces"),
            password: z.string().min(8, "Must be at least 8 characters"),
            firstName: z.string().min(2, "Must be at least 2 characters"),
            lastName: z.string().min(2, "Must be at least 2 characters"),
          }),
        )
        .handler(async (data) => {
          const accessRequest = await db.accessRequest.findFirst({ where: { id: params.id } })
          if (!accessRequest) return formError({ data, formError: "Invalid invitation" })
          const email = data.email.toLowerCase().trim()
          const existingEmail = await db.user.findFirst({ where: { email } })
          if (existingEmail) return formError({ data, formError: "User with this email already exists" })
          const username = data.username.toLowerCase().trim()
          const existingUsername = await db.user.findFirst({ where: { username } })
          if (existingUsername) return formError({ data, formError: "User with this username already exists" })
          const password = await hashPassword(data.password)
          const user = await db.user.create({
            data: {
              ...data,
              email,
              username,
              isVerified: true,
              password,
              lists: { create: { name: "Favourites", description: "All my favourite spots" } },
            },
          })
          await db.accessRequest.update({ where: { id: params.id }, data: { user: { connect: { id: user.id } } } })
          const { setUser } = await getUserSession(request)
          const headers = new Headers([["set-cookie", await setUser(user.id)]])
          track("Joined beta", { userId: user.id })
          return redirect("/onboarding", request, {
            headers,
            flash: { title: `Welcome to Ramble, ${data.firstName}!`, description: "Let's get you setup." },
          })
        }),
  })

export default function Register() {
  const { email } = useLoaderData<typeof loader>()
  return (
    <div className="center flex-col pt-10">
      <div className="bg-background w-full max-w-md space-y-8 p-4">
        <Form className="space-y-2">
          <h1 className="text-4xl font-bold">Invitation to beta</h1>
          <p>Thanks so much for joining the beta, all feedback is welcome!</p>
          <FormField
            defaultValue={email}
            autoCapitalize="none"
            required
            label="Email address"
            name="email"
            placeholder="sally.van.life@gmail.com"
          />
          <FormField required label="Password" name="password" type="password" placeholder="********" />
          <FormField autoCapitalize="none" required label="Choose a username" name="username" placeholder="sally" />
          <FormField required label="First name" name="firstName" placeholder="Sally" />
          <FormField required label="Last name" name="lastName" placeholder="Smith" />

          <div>
            <FormButton value={Actions.join} className="w-full">
              Join beta
            </FormButton>
            <FormError />
          </div>
        </Form>
      </div>
    </div>
  )
}
