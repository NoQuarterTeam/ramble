import { type FieldValues, useForm as useRForm, type UseFormProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type z } from "zod"
import { TRPCClientErrorLike } from "@trpc/client"

export function useForm<TFieldValues extends FieldValues = FieldValues, TContext = unknown>({
  schema,
  ...props
}: UseFormProps<TFieldValues, TContext> & { schema?: z.ZodSchema<unknown> | undefined }) {
  return useRForm({ resolver: schema ? zodResolver(schema) : undefined, ...props })
}

export type ApiError = TRPCClientErrorLike<{
  code: number
  message: string
  data: { zodError?: { fieldErrors: { [key: string]: undefined | string[] } } | null; formError?: string | null }
}> | null
