import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { z } from "~/lib/vendor/zod.server"

import { createSignedUrl } from "@ramble/api"

import { formError, validateFormData } from "~/lib/form.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const creatSignedUrlSchema = z.object({ key: z.string().min(1) })
  const result = await validateFormData(request, creatSignedUrlSchema)
  if (!result.success) return formError(result)
  const signedUrl = await createSignedUrl(result.data.key)
  return json(signedUrl)
}
