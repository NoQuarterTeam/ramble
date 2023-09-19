import { json as remixJson, redirect as remixRedirect } from "@vercel/remix"

import type { FlashMessage } from "~/services/session/flash.server"
import { FlashType, getFlashSession } from "~/services/session/flash.server"

export async function badRequest(
  data: unknown,
  request?: Request,
  init?: ResponseInit & { flash?: FlashMessage & { type?: FlashType } },
) {
  if (!request || !init) return remixJson(data, { status: 400, ...init })
  const headers = new Headers(init.headers)
  const flash = init.flash
  if (flash) {
    const { createFlash } = await getFlashSession(request)
    headers.append("Set-Cookie", await createFlash(flash.type || FlashType.Error, flash.title, flash.description))
  }

  return remixJson(data, { status: 400, ...init, headers })
}

export async function json<T>(data: T, request?: Request, init?: ResponseInit & { flash?: FlashMessage & { type?: FlashType } }) {
  if (!request || !init) return remixJson(data, { status: 200, ...init })
  const headers = new Headers(init.headers)
  const flash = init.flash
  if (flash) {
    const { createFlash } = await getFlashSession(request)
    headers.append("Set-Cookie", await createFlash(flash.type || FlashType.Info, flash.title, flash.description))
  }

  return remixJson(data, { status: 200, ...init, headers })
}

export const notFound = (data?: BodyInit) => new Response(data || null, { status: 404, statusText: "Not Found" })

export async function redirect(
  url: string,
  request?: Request,
  init?: ResponseInit & { flash?: FlashMessage & { type?: FlashType } },
) {
  if (!request || !init) return remixRedirect(url)
  const headers = new Headers(init.headers)
  const flash = init.flash
  if (flash) {
    const { createFlash } = await getFlashSession(request)
    headers.append("Set-Cookie", await createFlash(flash.type || FlashType.Info, flash.title, flash.description))
  }

  return remixRedirect(url, { ...init, headers })
}
