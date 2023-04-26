import type { ActionArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { z } from "zod"

import { formError, validateFormData } from "~/lib/form"

import { createSignedUrl } from "~/services/s3/s3.server"

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()
  const creatSignedUrlSchema = z.object({ key: z.string().min(1) })
  const result = await validateFormData(creatSignedUrlSchema, formData)
  if (!result.success) return formError(result)
  return json(createSignedUrl(result.data.key))
}
