import { json } from "@vercel/remix"
import { z } from "zod"

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
async function createActionsCore<
  TKey extends string,
  TInput extends z.ZodObject<{ [key: string]: z.ZodString | typeof NullableFormNumber | typeof FormNumber }>,
  Actions extends Record<TKey, { input: TInput; handler: (data: z.infer<Actions[TKey]["input"]>) => unknown }>,
>(request: Request, actions: Actions) {
  const formAction = await getFormAction<TKey>(request)
  const action = actions[formAction]
  if (!action) return badRequest("Invalid action", request)
  const result = await validateFormData(request, action.input)
  if (!result.success) return formError(result)
  const data = result.data
  try {
    return await action.handler(data)
  } catch (error) {
    console.log(error)
    return badRequest("Request failed", request, { flash: { title: "Request failed", description: "We have been notified!" } })
  }
}

export function createActions<T extends string>(
  request: Request,
  actions: Record<
    T,
    {
      input: z.ZodObject<{ [key: string]: z.ZodString | typeof NullableFormNumber | typeof FormNumber }>
      handler: (data: z.infer<z.AnyZodObject>) => unknown
    }
  >,
) {
  return createActionsCore(request, actions)
}
