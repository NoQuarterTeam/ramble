"use client"

import { FormError, FormField } from "@/components/Form"
import { FormButton } from "@/components/FormButton"
import { useFormState } from "react-dom"
import { action } from "./action"

export default function ForgotPassword() {
  const [state, formAction] = useFormState(action, { ok: false })
  if (state.ok)
    return (
      <div className="space-y-2">
        <h1 className="text-4xl">Instructions sent</h1>
        <p>Check your email for instructions to reset your password.</p>
      </div>
    )
  return (
    <form className="space-y-2" action={formAction}>
      <h1 className="text-4xl">Forgot password?</h1>
      <p>Enter your email below to receive your password reset instructions.</p>
      <FormField required label="Email address" name="email" placeholder="jim@gmail.com" errors={state.fieldErrors?.email} />
      <FormError error={state.formError} />
      <FormButton className="w-full">Send instructions</FormButton>
    </form>
  )
}
