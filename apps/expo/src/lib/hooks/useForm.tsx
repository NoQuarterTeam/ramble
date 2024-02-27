import { type TRPCClientErrorLike } from "@trpc/client"
import { type FieldValues, type UseFormProps, useForm as useRForm } from "react-hook-form"

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
