import { z } from "zod"

import { json } from "~/lib/vendor/vercel.server"
import { csrf } from "~/services/session/csrf.server.ts"

import { FORM_ACTION } from "./form"
import { badRequest } from "./remix.server"

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

export type FormError<T> = { formError?: string; fieldErrors?: FieldErrors<T>; data?: Record<string, unknown> }

export async function getFormAction<T>(request: Request): Promise<T> {
  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()
  return formData.get(FORM_ACTION) as T
}

export type ActionDataErrorResponse<Schema extends z.ZodTypeAny> = {
  success: false
  formError?: string
  fieldErrors?: FieldErrors<z.infer<Schema>>
  data?: z.infer<Schema>
}

export type FieldErrors<T> = {
  [Property in keyof T]: string[]
}

type ValidForm<Schema extends z.ZodTypeAny> = {
  success: true
  data: z.infer<Schema>
}
export type InvalidForm<Schema extends z.ZodTypeAny> = {
  success: false
  fieldErrors: FieldErrors<z.infer<Schema>>
  data: z.infer<Schema>
}

export async function validateFormData<Schema extends z.ZodTypeAny>(
  request: Request,
  schema: Schema,
): Promise<ValidForm<Schema> | InvalidForm<Schema>> {
  const csrfRequest = request.clone()
  await csrf.validate(csrfRequest)
  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()
  const data = Object.fromEntries(formData)
  const validations = schema.safeParse(data)
  if (validations.success) return validations
  const fieldErrors = validations.error.flatten().fieldErrors as FieldErrors<Schema>
  return { fieldErrors, success: false, data }
}

export function formError<Schema extends z.ZodTypeAny>(args: Omit<ActionDataErrorResponse<Schema>, "success">) {
  return json({ ...args, success: false }, { status: 400 })
}

type HandlerResult = Promise<unknown> | unknown

export function createAction<Schema extends z.AnyZodObject>(request: Request) {
  return {
    input: <T extends Schema>(schema: T) => {
      return {
        handler: async (fn: (data: z.infer<T>) => HandlerResult) => {
          const result = await validateFormData(request, schema)
          if (!result.success) return formError(result)
          try {
            return await fn(result.data)
          } catch (error) {
            console.log(error)
            return badRequest("Request failed", request, {
              flash: { title: "Request failed", description: "We have been notified!" },
            })
          }
        },
      }
    },
    handler: async (fn: () => HandlerResult) => {
      try {
        return await fn()
      } catch (error) {
        console.log(error)
        return badRequest("Request failed", request, {
          flash: { title: "Request failed", description: "We have been notified!" },
        })
      }
    },
  }
}
export async function createActions<Action extends string>(request: Request, actions: Record<Action, HandlerResult>) {
  const formAction = await getFormAction<Action>(request)
  if (!formAction) return badRequest("Invalid action", request)
  return actions[formAction]
}
