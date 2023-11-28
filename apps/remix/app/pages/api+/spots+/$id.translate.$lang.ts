import { env } from "@ramble/server-env"
import { LoaderFunctionArgs, SerializeFrom } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import { db } from "~/lib/db.server"
import { badRequest, json } from "~/lib/remix.server"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { id, lang } = params
  if (!id || !lang) throw badRequest({ message: "Missing spot id or lang" })
  const spot = await db.spot.findUniqueOrThrow({ where: { id }, select: { id: true, description: true } })
  if (!spot.description) return json({ text: "", sourceLang: "" })

  const detectParams = new URLSearchParams()
  detectParams.append("q", spot.description)
  detectParams.append("key", env.GOOGLE_API_KEY)
  const detectRes = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?${detectParams.toString()}`)
  const detectData = await detectRes.json()
  const detectedLang = detectData.data?.detections[0]?.[0]?.language as string | undefined
  if (!detectedLang) throw badRequest({ message: "Could not detect language" })
  if (detectData === lang) return json({ text: spot.description, sourceLang: detectedLang })
  const searchParams = new URLSearchParams()
  searchParams.append("q", spot.description)
  searchParams.append("target", lang)
  searchParams.append("source", detectedLang)
  searchParams.append("key", env.GOOGLE_API_KEY)
  searchParams.append("format", "text")
  const res = await fetch(`https://translation.googleapis.com/language/translate/v2?${searchParams.toString()}`)
  const data = await res.json()
  const translatedText = data.data?.translations?.[0]?.translatedText as string | undefined
  return json({ text: translatedText, sourceLang: detectedLang }, request, {
    headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1month", sMaxage: "1hour" }) },
  })
}

export type TranslateSpot = SerializeFrom<typeof loader>
