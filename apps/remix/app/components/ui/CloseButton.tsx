"use client"
import { X } from "lucide-react"
import * as React from "react"

import { IconButton, type IconButtonProps } from "./IconButton"

export const CloseButton = React.forwardRef<HTMLButtonElement, Omit<IconButtonProps, "ref" | "icon" | "aria-label">>(
  function _CloseButton(props, ref) {
    const size = {
      xs: "sq-3",
      sm: "sq-4",
      md: "sq-5",
      lg: "sq-6",
    }[props.size ?? "md"]
    return <IconButton ref={ref} variant="ghost" icon={<X className={size} />} aria-label="close" size="md" {...props} />
  },
)
