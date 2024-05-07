import { env } from "@ramble/server-env"
import * as Sentry from "@sentry/nextjs"

export async function getTranslation(text: string | null | undefined, preferredLang: string) {
  try {
    if (!text) return null
    if (!preferredLang) return text
    const params = new URLSearchParams()
    params.append("q", text)
    params.append("key", env.GOOGLE_API_KEY)
    const detectRes = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?${params.toString()}`)
    const detectData = await detectRes.json()
    const detectedLang = detectData.data?.detections[0]?.[0]?.language as string | undefined
    if (!detectedLang) return text
    if (detectData === preferredLang) return text
    params.append("target", preferredLang)
    params.append("source", detectedLang)
    params.append("format", "text")
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?${params.toString()}`)
    const data = await res.json()
    const translatedText = data.data?.translations?.[0]?.translatedText as string | undefined
    return translatedText || text
  } catch (error) {
    Sentry.captureException(error)
    return text
  }
}
