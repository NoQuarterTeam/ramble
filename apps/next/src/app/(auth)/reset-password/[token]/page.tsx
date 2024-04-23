import { cacheHeader } from "pretty-cache-header"
import { z } from "zod"

import { hashPassword } from "@ramble/server-services"
import Link from "next/link"

// export const action = async ({ request }: ActionFunctionArgs) => {
//   const resetPasswordSchema = z.object({
//     token: z.string(),
//     password: z.string().min(8, "Must be at least 8 characters"),
//   })
//   const result = await validateFormData(request, resetPasswordSchema)
//   if (!result.success) return formError(result)
//   const data = result.data
//   const payload = await decryptToken<{ id: string }>(data.token)
//   const hashedPassword = await hashPassword(data.password)
//   await db.user.update({ where: { id: payload.id }, data: { password: hashedPassword } })
//   return redirect("/login", request, {
//     flash: { title: "Password changed", description: "You can now login with your new password" },
//   })
// }

export default function ResetPassword({ params: { token } }: { params: { token: string } }) {
  return (
    <form>
      <div className="space-y-2">
        <div>
          <h1 className="text-4xl">Reset password</h1>
          <p>Enter a new password below.</p>
        </div>
        <input name="token" type="hidden" value={token} />
        {/* <FormField required label="Password" name="password" type="password" placeholder="********" />
        <FormError />
        <FormButton className="w-full">Reset</FormButton> */}
      </div>
    </form>
  )
}
