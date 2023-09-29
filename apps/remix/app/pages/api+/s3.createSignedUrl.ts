import type { ActionFunctionArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { z } from "zod"

import { createSignedUrl } from "@ramble/api"

import { formError, validateFormData } from "~/lib/form"

export const action = async ({ request }: ActionFunctionArgs) => {
  const creatSignedUrlSchema = z.object({ key: z.string().min(1) })
  const result = await validateFormData(request, creatSignedUrlSchema)
  if (!result.success) return formError(result)
  const signedUrl = await createSignedUrl(result.data.key)
  return json(signedUrl)
}
