import { Link } from "@remix-run/react"
import type { ActionArgs, V2_MetaFunction } from "@vercel/remix"
import { redirect } from "@vercel/remix"
import { z } from "zod"

import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { badRequest } from "~/lib/remix.server"
import { hashPassword } from "~/services/auth/password.server"
import { FlashType, getFlashSession } from "~/services/session/flash.server"
import { getUserSession } from "~/services/session/session.server"

export const meta: V2_MetaFunction = () => {
  return [{ title: "Register" }, { name: "description", content: "Sign up to the ramble" }]
}
export const headers = () => {
  return {
    "Cache-Control": "max-age=3600, s-maxage=86400",
  }
}

enum Actions {
  Register = "Register",
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const action = formData.get("_action") as Actions | undefined

  switch (action) {
    case Actions.Register:
      try {
        if (formData.get("passwordConfirmation")) return redirect("/")
        const registerSchema = z.object({
          email: z.string().min(3).email("Invalid email"),
          username: z.string().min(2),
          password: z.string().min(8, "Must be at least 8 characters"),
          firstName: z.string().min(2, "Must be at least 2 characters"),
          lastName: z.string().min(2, "Must be at least 2 characters"),
        })
        const result = await validateFormData(formData, registerSchema)
        if (!result.success) return formError(result)
        const data = result.data
        const email = data.email.toLowerCase().trim()
        const existingEmail = await db.user.findFirst({ where: { email } })
        if (existingEmail) return formError({ data, formError: "User with this email already exists" })
        const username = data.username.toLowerCase().trim()
        const existingUsername = await db.user.findFirst({ where: { username } })
        if (existingUsername) return formError({ data, formError: "User with this username already exists" })
        const password = await hashPassword(data.password)
        const user = await db.user.create({ data: { ...data, email, password, lists: { create: { name: "Favourites" } } } })
        const { setUser } = await getUserSession(request)
        const { createFlash } = await getFlashSession(request)
        const headers = new Headers([
          ["Set-Cookie", await setUser(user.id)],
          ["Set-Cookie", await createFlash(FlashType.Info, `Welcome to Ramble, ${data.firstName}!`, "Let's get you setup.")],
        ])
        return redirect("/onboarding", { headers })
      } catch {
        return badRequest("Error registering your account")
      }

    default:
      break
  }
}

export default function Register() {
  return (
    <Form method="post" replace className="space-y-2">
      <h1 className="text-4xl font-bold">Register</h1>
      <FormField autoCapitalize="none" required label="Email address" name="email" placeholder="jim@gmail.com" />
      <FormField required label="Password" name="password" type="password" placeholder="********" />
      <input name="passwordConfirmation" className="hidden" />
      <FormField autoCapitalize="none" required label="Choose a username" name="username" placeholder="Jim93" />
      <FormField required label="First name" name="firstName" placeholder="Jim" />
      <FormField required label="Last name" name="lastName" placeholder="Bob" />
      <div>
        <FormButton name="_action" value={Actions.Register} className="w-full">
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
