import { z } from "zod"
import { badRequest } from "./remix"

export type FieldErrors<T> = {
  [Property in keyof T]: string[]
}

type ValidForm<Schema extends z.ZodType<unknown>> = {
  success: true
  data: z.infer<Schema>
}
type InvalidForm<Schema extends z.ZodType<unknown>> = {
  success: false
  fieldErrors: FieldErrors<Schema>
}

export async function validateFormData<Schema extends z.ZodType<unknown>>(
  schema: Schema,
  formData: FormData,
): Promise<ValidForm<Schema> | InvalidForm<Schema>> {
  const data = Object.fromEntries(formData)
  const validations = schema.safeParse(data)
  if (validations.success) return validations
  const fieldErrors = validations.error.flatten().fieldErrors as FieldErrors<Schema>
  return { fieldErrors, success: false }
}

export type ActionData<T> = {
  formError?: string
  fieldErrors?: FieldErrors<T>
  data?: T
}

export const getFormDataArray = (formData: FormData, field: string) =>
  [...formData.entries()]
    .filter(([key]) => key.startsWith(field))
    .reduce((acc, [key, value]) => {
      const [prefix, name] = key.split(".")
      const id = Number(prefix.charAt(prefix.lastIndexOf("[") + 1))
      acc[id] = {
        ...acc[id],
        [name]: value as string | undefined,
      }
      return acc
    }, [] as Array<Record<string, string | undefined>>)

export function formError(args: { formError?: string; fieldErrors?: FieldErrors<unknown>; data?: Record<string, unknown> }) {
  return badRequest(args)
}

const boolean = z
  .string()
  .regex(/^(true|false)$/, 'Must be a boolean string ("true" or "false")')
  .transform((value) => value === "true")

const checkbox = z
  .literal("on")
  .optional()
  .transform((value) => value === "on")

const int = z
  .string()
  .regex(/^-?\d+$/, "Must be an integer string")
  .transform((val) => parseInt(val, 10))

const num = z
  .string()
  .regex(/^-?\d*\.?\d+$/, "Must be a number string")
  .transform(Number)

export const zform = {
  boolean,
  checkbox,
  int,
  num,
}
