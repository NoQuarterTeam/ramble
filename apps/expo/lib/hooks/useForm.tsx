import { type FieldValues, useForm as useRForm, type UseFormProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type z } from "zod"

export function useForm<TFieldValues extends FieldValues = FieldValues, TContext = unknown>({
  schema,
  ...props
}: UseFormProps<TFieldValues, TContext> & { schema: z.ZodSchema<unknown> }) {
  return useRForm({ resolver: zodResolver(schema), ...props })
}
