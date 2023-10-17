import { Link, useParams } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"

import { Form, FormButton, FormError, FormField } from "~/components/Form"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form.server"
import { decryptToken } from "~/lib/jwt.server"
import { redirect } from "~/lib/remix.server"
import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { z } from "~/lib/vendor/zod.server"
import { hashPassword } from "~/services/auth/password.server"

// export const config = {
//   // runtime: "edge",
//   // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
// }

export const headers = () => {
  return {
    "Cache-Control": cacheHeader({ maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min", public: true }),
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8, "Must be at least 8 characters"),
  })
  const result = await validateFormData(request, resetPasswordSchema)
  if (!result.success) return formError(result)
  const data = result.data
  const payload = await decryptToken<{ id: string }>(data.token)
  const hashedPassword = await hashPassword(data.password)
  const user = await db.user.update({ where: { id: payload.id }, data: { password: hashedPassword } })
  track("Password updated", { userId: user.id })
  return redirect("/login", request, {
    flash: { title: "Password changed", description: "You can now login with your new password" },
  })
}

export default function ResetPassword() {
  const { token } = useParams()

  return (
    <Form>
      <div className="space-y-2">
        <div>
          <h1 className="text-4xl font-bold">Reset password</h1>
          <p>Enter a new password below.</p>
        </div>
        <input name="token" type="hidden" value={token} />
        <FormField required label="Password" name="password" type="password" placeholder="********" />
        <FormError />
        <FormButton className="w-full">Reset</FormButton>
        <Link to="/login">Login</Link>
      </div>
    </Form>
  )
}
