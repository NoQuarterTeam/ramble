import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

export const GET = () => {
  revalidatePath("/blog/[slug]/page", "page")
  revalidateTag("blog-detail")
  return NextResponse.json({ ok: true })
}
