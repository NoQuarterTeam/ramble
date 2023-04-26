import { type ActionArgs, redirect } from "@vercel/remix"
import { Link } from "@remix-run/react"
import { z } from "zod"

import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { createToken } from "~/lib/jwt.server"
import { FlashType, getFlashSession } from "~/services/session/flash.server"
import { sendResetPasswordEmail } from "~/services/user/user.mailer.server"

export const headers = () => {
  return {
    "Cache-Control": "max-age=3600, s-maxage=86400",
  }
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const resetSchema = z.object({ email: z.string().email("Invalid email") })
  const result = await validateFormData(resetSchema, formData)
  if (!result.success) return formError(result)
  const data = result.data
  const user = await db.user.findUnique({ where: { email: data.email } })
  if (user) {
    const token = createToken({ id: user.id })
    await sendResetPasswordEmail(user, token)
  }
  const { createFlash } = await getFlashSession(request)
  return redirect("/login", {
    headers: { "Set-Cookie": await createFlash(FlashType.Info, "Reset link sent to your email") },
  })
}

export default function ForgotPassword() {
  return (
    <Form method="post">
      <div className="stack">
        <h1 className="text-4xl font-bold">Forgot password?</h1>
        <p>Enter your email below to receive your password reset instructions.</p>
        <FormField required label="Email address" name="email" placeholder="jim@gmail.com" />
        <FormError />
        <FormButton className="w-full">Send instructions</FormButton>
        <Link to="/login">Login</Link>
      </div>
    </Form>
  )
}
