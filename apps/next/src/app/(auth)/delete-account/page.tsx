"use client"
import { FormError, FormField } from "@/components/Form"
import { FormButton } from "@/components/FormButton"
import { Button } from "@/components/ui"
import * as React from "react"
import { useFormState } from "react-dom"
import { action } from "./action"

export default function Page() {
  const [isConfirmed, setIsConfirmed] = React.useState(false)
  const [state, formAction] = useFormState(action, { ok: false })
  if (state.ok)
    return (
      <div className="space-y-2">
        <h1 className="text-4xl">Account deleted.</h1>
        <p>Sorry to see you go :(</p>
      </div>
    )
  return (
    <form action={formAction}>
      <div className="space-y-2">
        <div>
          <h1 className="text-4xl">Delete account</h1>
          <p>We will remove all data associated with this email. This can't be undone!</p>
        </div>

        <FormField required label="Email" name="email" type="email" errors={state.fieldErrors?.email} />
        <FormField required label="Password" name="password" type="password" errors={state.fieldErrors?.password} />
        <FormError error={state.formError} />
        {!isConfirmed ? (
          <Button type="button" className="w-full" onClick={() => setIsConfirmed(true)}>
            Confirm
          </Button>
        ) : (
          <FormButton className="w-full">Are you sure?</FormButton>
        )}
      </div>
    </form>
  )
}
