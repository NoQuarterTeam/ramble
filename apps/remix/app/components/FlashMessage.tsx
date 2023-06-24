import * as React from "react"
import { type SerializeFrom } from "@vercel/remix"

import { useToast } from "~/components/ui"
import { type loader } from "~/root"

interface Props {
  flash: SerializeFrom<typeof loader>["flash"]
}

export function FlashMessage(props: Props) {
  const { toast } = useToast()
  React.useEffect(() => {
    if (props.flash.flashError) {
      toast({ title: props.flash.flashError.title, description: props.flash.flashError.description, variant: "destructive" })
    }
    if (props.flash.flashInfo) {
      toast({ title: props.flash.flashInfo.title, description: props.flash.flashInfo.description })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.flash])
  return null
}
