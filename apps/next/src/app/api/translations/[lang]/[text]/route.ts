import { cacheHeader } from "pretty-cache-header"

import { getTranslation } from "@ramble/server-services"
import { notFound } from "next/navigation"
import { NextResponse } from "next/server"

export const GET = async (_request: Request, { params }: { params: { lang: string; text: string } }) => {
  const { lang, text } = params
  if (!lang || !text) throw notFound()
  const translation = await getTranslation(text, lang)
  return NextResponse.json(translation, {
    status: 200,
    headers: {
      "Cache-Control": cacheHeader({ immutable: true, public: true, maxAge: "1month", sMaxage: "1week" }),
    },
  })
}
