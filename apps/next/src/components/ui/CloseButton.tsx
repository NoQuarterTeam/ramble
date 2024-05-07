"use client"
import { X } from "lucide-react"
import * as React from "react"

import { IconButton, type IconButtonProps } from "./IconButton"

export const CloseButton = React.forwardRef<HTMLButtonElement, Omit<IconButtonProps, "ref" | "icon" | "aria-label">>(
  function _CloseButton(props, ref) {
    const size = {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    }[props.size ?? "md"]
    return <IconButton ref={ref} variant="ghost" icon={<X className={size} />} aria-label="close" size="md" {...props} />
  },
)
