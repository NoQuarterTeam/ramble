import { cacheHeader } from "pretty-cache-header"

import { db } from "@/lib/server/db"
import { getTranslation } from "@ramble/server-services"
import { notFound } from "next/navigation"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export const GET = async (_request: Request, { params }: { params: { id: string; lang: string } }) => {
  const { id, lang } = params
  const review = await db.review.findUnique({ where: { id }, select: { description: true } })
  if (!review || !lang) throw notFound()
  const text = await getTranslation(review.description, lang)
  return NextResponse.json(text, {
    status: 200,
    headers: {
      "Cache-Control": cacheHeader({ immutable: true, public: true, maxAge: "1month", sMaxage: "1week" }),
    },
  })
}
