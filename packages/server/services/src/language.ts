import { env } from "@ramble/server-env"
import * as Sentry from "@sentry/nextjs"

export async function getLanguage(text: string | null | undefined) {
  try {
    if (!text) return null
    const params = new URLSearchParams()
    params.append("q", text)
    params.append("key", env.GOOGLE_API_KEY)
    const detectRes = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?${params.toString()}`)
    const detectData = await detectRes.json()
    const detectedLang = detectData.data?.detections[0]?.[0]?.language as string | undefined
    if (!detectedLang) return null
    return detectedLang
  } catch (error) {
    Sentry.captureException(error)
    return null
  }
}
