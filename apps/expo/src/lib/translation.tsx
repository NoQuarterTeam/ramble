import * as Sentry from "@sentry/react-native"
import { FULL_WEB_URL } from "./config"

export type TranslateInput = { text?: string | null; lang: string }

export async function getTranslation({ lang, text }: TranslateInput) {
  try {
    if (!text) return
    const res = await fetch(`${FULL_WEB_URL}/api/translations/${lang}/${text}`)
    return await res.json()
  } catch (e) {
    Sentry.captureException(e)
    return "Error translating text"
  }
}
