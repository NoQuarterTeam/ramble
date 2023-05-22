/* eslint-disable @typescript-eslint/no-explicit-any */
import { useActionData } from "react-router"
import { z } from "zod"

import { badRequest } from "./remix.server"

export type FieldErrors<T> = {
  [Property in keyof T]: string[]
}

type ValidForm<Schema extends z.ZodType<unknown>> = {
  success: true
  data: z.infer<Schema>
}
export type InvalidForm<Schema extends z.ZodType<unknown>> = {
  success: false
  fieldErrors: FieldErrors<z.infer<Schema>>
}

export async function validateFormData<Schema extends z.ZodType<unknown>>(
  init: FormData | Request,
  schema: Schema,
): Promise<ValidForm<Schema> | InvalidForm<Schema>> {
  const maybeFormData = init instanceof FormData ? init : await init.formData()
  const data = Object.fromEntries(maybeFormData)
  const validations = schema.safeParse(data)
  if (validations.success) return validations
  const fieldErrors = validations.error.flatten().fieldErrors as FieldErrors<Schema>
  return { fieldErrors, success: false }
}

export function formError<Schema extends z.ZodType<unknown>>(args: ActionData<Schema>) {
  return badRequest(args)
}

export type FormError<T> = { formError?: string; fieldErrors?: FieldErrors<T>; data?: Record<string, unknown> }

export type ActionData<Schema extends z.ZodType<unknown>> = {
  formError?: string
  fieldErrors?: FieldErrors<z.infer<Schema>>
  data?: z.infer<Schema>
}

export function useFormErrors<Schema extends z.ZodType<unknown>>() {
  return useActionData() as Partial<ActionData<Schema>> | null
}

export const NullableFormString = z.preprocess((v) => (v === "" ? null : v), z.string().nullish())

export const NullableFormNumber = z.preprocess(
  (v) => (v === "" ? null : v),
  z.coerce.number({ invalid_type_error: "Not a number" }).nullish(),
)
export const FormNumber = z.coerce.number({ invalid_type_error: "Not a number" })

export const FormCheckbox = z
  .literal("on")
  .optional()
  .transform((value) => value === "on")
