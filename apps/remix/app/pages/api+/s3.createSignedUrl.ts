import { randomUUID } from "node:crypto"
import { z } from "zod"

import { createSignedUrl } from "@ramble/server-services"

import { assetPrefix } from "@ramble/shared"
import { formError, validateFormData } from "~/lib/form.server"
import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const creatSignedUrlSchema = z.object({ type: z.string() })
  const result = await validateFormData(request, creatSignedUrlSchema)
  if (!result.success) return formError(result)
  const uuid = randomUUID()
  const key = `${assetPrefix}${uuid}.${result.data.type}`
  return json({ url: await createSignedUrl(key), key })
}
