"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"
import { Button, type ButtonProps } from "./ui"

export const FormButton = React.forwardRef<HTMLButtonElement, ButtonProps>(function _FormButton(props, ref) {
  const { pending } = useFormStatus()

  return <Button type="submit" isLoading={pending || props.isLoading} {...props} ref={ref} />
})
