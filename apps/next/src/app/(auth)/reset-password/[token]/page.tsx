"use client"

import { FormError, FormField } from "@/components/Form"
import { FormButton } from "@/components/FormButton"
import { useFormState } from "react-dom"
import { action } from "./action"

export default function ResetPassword({ params: { token } }: { params: { token: string } }) {
  const [state, formAction] = useFormState(action, { ok: false })
  if (state.ok)
    return (
      <div className="space-y-2">
        <h1 className="text-4xl">Password reset!</h1>
        <p>Try logging in with your new password.</p>
      </div>
    )
  return (
    <form action={formAction}>
      <div className="space-y-2">
        <div>
          <h1 className="text-4xl">Reset password</h1>
          <p>Enter a new password below.</p>
        </div>
        <input name="token" type="hidden" value={token} />
        <FormField
          required
          label="Password"
          name="password"
          type="password"
          placeholder="********"
          errors={state.fieldErrors?.password}
        />
        <FormError error={state.formError} />
        <FormButton className="w-full">Reset</FormButton>
      </div>
    </form>
  )
}
