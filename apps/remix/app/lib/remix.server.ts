import { json, redirect as remixRedirect } from "@vercel/remix"

import type { FlashMessage, FlashType } from "~/services/session/flash.server"
import { getFlashSession } from "~/services/session/flash.server"

export const badRequest = (data: unknown, init?: ResponseInit) => json(data, { status: 400, ...init })
export const notFound = (data: unknown) => json(data, { status: 404 })

export async function redirect(
  url: string,
  request?: Request,
  init?: ResponseInit & { flash?: FlashMessage & { type: FlashType } },
) {
  if (!request || !init) return remixRedirect(url)
  const { createFlash } = await getFlashSession(request)
  const headers = new Headers(init.headers)
  const flash = init.flash
  if (flash) {
    headers.append("Set-Cookie", await createFlash(flash.type, flash.title, flash.description))
  }

  return remixRedirect(url, { ...init, headers })
}
