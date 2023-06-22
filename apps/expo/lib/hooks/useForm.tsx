import { type FieldValues, useForm as useRForm, type UseFormProps } from "react-hook-form"

import { TRPCClientErrorLike } from "@trpc/client"

export function useForm<TFieldValues extends FieldValues = FieldValues, TContext = unknown>(
  props: UseFormProps<TFieldValues, TContext>,
) {
  return useRForm(props)
}

export type ApiError = TRPCClientErrorLike<{
  code: number
  message: string
  data: { zodError?: { fieldErrors: { [key: string]: undefined | string[] } } | null; formError?: string | null }
}> | null
