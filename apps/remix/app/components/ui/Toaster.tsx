"use client"
import * as React from "react"
import { Toaster as SToaster, toast } from "sonner"
import type { FlashMessage } from "~/services/session/flash.server"

type Flash = {
  flashError: FlashMessage
  flashInfo: FlashMessage
}
export function Toaster({ flash }: { flash: Flash }) {
  return (
    <>
      <SToaster closeButton />
      {flash && <ShowToast flash={flash} />}
    </>
  )
}

function ShowToast({ flash }: { flash: Flash }) {
  React.useEffect(() => {
    const { flashError, flashInfo } = flash
    const type = flashError ? "error" : "success"
    const message = flashError || flashInfo
    const timeout = setTimeout(() => {
      toast[type](message.title, { description: message.description })
    }, 0)
    return () => {
      clearTimeout(timeout)
    }
  }, [flash])
  return null
}
