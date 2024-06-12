"use client"
import { FormError, FormField } from "@/components/Form"
import { FormButton } from "@/components/FormButton"
import { useFormState } from "react-dom"
import { action } from "./action"

export default function Page() {
  const [state, formAction] = useFormState(action, { ok: false })
  return (
    <form className="space-y-2" action={formAction}>
      <h1 className="text-4xl">Login</h1>
      <FormField required label="Email" name="email" type="email" errors={state.fieldErrors?.email} />
      <FormField required label="Password" name="password" type="password" errors={state.fieldErrors?.password} />
      <FormError error={state.formError} />
      <FormButton className="w-full">Login</FormButton>
    </form>
  )
}
