import * as React from "react"

import type { ApiError } from "~/lib/hooks/useForm"

import { toast } from "./Toast"

interface Props {
  error?: ApiError
}
export function FormError({ error }: Props) {
  const errorToRender = error ? (typeof error === "string" ? error : error.data?.formError) : null
  React.useEffect(() => {
    if (!errorToRender) return
    toast({ title: errorToRender, type: "error" })
  }, [errorToRender])
  return null
}
