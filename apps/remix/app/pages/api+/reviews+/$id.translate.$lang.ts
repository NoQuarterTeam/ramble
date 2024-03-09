import type { LoaderFunctionArgs, SerializeFrom } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { db } from "~/lib/db.server"
import { json, notFound } from "~/lib/remix.server"
import { getTranslation } from "~/services/translate.server"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { id, lang } = params
  const review = await db.review.findUnique({ where: { id }, select: { description: true } })
  if (!review || !lang) throw notFound()
  const text = await getTranslation(review.description, lang)
  return json(text, request, {
    headers: { "Cache-Control": cacheHeader({ immutable: true, public: true, maxAge: "1month", sMaxage: "1hour" }) },
  })
}

export type TranslateReview = SerializeFrom<typeof loader>
