import { type LoaderFunctionArgs, type SerializeFrom } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { type Spot, type User } from "@ramble/database/types"
import { env } from "@ramble/server-env"

import { db } from "~/lib/db.server"
import { json, notFound } from "~/lib/remix.server"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { id, lang } = params
  const spot = await db.spot.findUnique({ where: { id }, select: { description: true } })
  if (!spot || !lang) throw notFound()
  const text = await getSpotDescription(spot, lang)
  return json(text, request, {
    headers: { "Cache-Control": cacheHeader({ immutable: true, public: true, maxAge: "1month", sMaxage: "1hour" }) },
  })
}

export type TranslateSpot = SerializeFrom<typeof loader>

export async function getSpotDescription(
  spot: Pick<Spot, "description">,
  preferredLang: Pick<User, "preferredLanguage">["preferredLanguage"],
) {
  if (!spot.description) return null
  if (!preferredLang) return spot.description
  const params = new URLSearchParams()
  params.append("q", spot.description)
  params.append("key", env.GOOGLE_API_KEY)
  const detectRes = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?${params.toString()}`)
  const detectData = await detectRes.json()
  const detectedLang = detectData.data?.detections[0]?.[0]?.language as string | undefined
  if (!detectedLang) return spot.description
  if (detectData === preferredLang) return spot.description
  params.append("target", preferredLang)
  params.append("source", detectedLang)
  params.append("format", "text")
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?${params.toString()}`)
  const data = await res.json()
  const translatedText = data.data?.translations?.[0]?.translatedText as string | undefined
  return translatedText || spot.description
}
