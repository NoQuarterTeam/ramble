import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

export const GET = () => {
  revalidatePath("/blog", "page")
  revalidateTag("blog")
  return NextResponse.json({ ok: true })
}
