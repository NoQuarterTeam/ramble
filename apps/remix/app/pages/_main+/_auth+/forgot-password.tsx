import { Link } from "@remix-run/react"
import { type ActionFunctionArgs } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import { z } from "zod"

import { sendResetPasswordEmail } from "@ramble/api"

import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { createToken } from "~/lib/jwt.server"
import { redirect } from "~/lib/remix.server"

export const headers = () => {
  return {
    "Cache-Control": cacheHeader({ maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min", public: true }),
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const resetSchema = z.object({ email: z.string().email("Invalid email") })
  const result = await validateFormData(request, resetSchema)
  if (!result.success) return formError(result)
  const data = result.data
  const user = await db.user.findUnique({ where: { email: data.email } })
  if (user) {
    const token = await createToken({ id: user.id })
    await sendResetPasswordEmail(user, token)
  }

  return redirect("/login", request, { flash: { title: "Reset link sent to your email" } })
}

export default function ForgotPassword() {
  return (
    <Form className="space-y-2">
      <h1 className="text-4xl font-bold">Forgot password?</h1>
      <p>Enter your email below to receive your password reset instructions.</p>
      <FormField required label="Email address" name="email" placeholder="jim@gmail.com" />
      <FormError />
      <FormButton className="w-full">Send instructions</FormButton>
      <Link to="/login">Login</Link>
    </Form>
  )
}
