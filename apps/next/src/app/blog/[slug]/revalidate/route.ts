import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

export const GET = () => {
  revalidatePath("/blog/[slug]/page", "page")
  return NextResponse.json({ ok: true })
}
