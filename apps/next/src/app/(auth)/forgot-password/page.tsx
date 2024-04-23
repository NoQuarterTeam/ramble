import { z } from "zod"

import { sendResetPasswordEmail } from "@ramble/server-services"

// import { Form, FormButton, FormError, FormField } from "~/components/Form"
// import { track } from "~/lib/analytics.server"
// import { db } from "~/lib/db.server"
// import { formError, validateFormData } from "~/lib/form.server"
// import { createToken } from "~/lib/jwt.server"
// import { redirect } from "~/lib/remix.server"
// import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"

// export const action = async ({ request }: ActionFunctionArgs) => {
//   const resetSchema = z.object({ email: z.string().email("Invalid email") })
//   const result = await validateFormData(request, resetSchema)
//   if (!result.success) return formError(result)
//   const data = result.data
//   const user = await db.user.findUnique({ where: { email: data.email } })
//   if (user) {
//     const token = await createToken({ id: user.id })
//     await sendResetPasswordEmail(user, token)
//     track("Reset password requested", { userId: user.id })
//   }

//   return redirect("/login", request, { flash: { title: "Reset link sent to your email" } })
// }

export default function ForgotPassword() {
  return (
    <form className="space-y-2">
      <h1 className="text-4xl">Forgot password?</h1>
      <p>Enter your email below to receive your password reset instructions.</p>
      {/* <FormField required label="Email address" name="email" placeholder="jim@gmail.com" /> */}
      {/* <FormError /> */}
      {/* <FormButton className="w-full">Send instructions</FormButton> */}
    </form>
  )
}
