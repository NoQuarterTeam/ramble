import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

export const GET = () => {
  revalidatePath("/blog")
  return NextResponse.json({ ok: true })
}
