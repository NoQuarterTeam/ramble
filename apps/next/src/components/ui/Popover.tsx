"use client"
import * as Popover from "@radix-ui/react-popover"
import * as React from "react"

import { merge } from "@ramble/shared"

export * from "@radix-ui/react-popover"

export const PopoverContent = React.forwardRef<HTMLDivElement, Popover.PopoverContentProps>(function _Content(props, ref) {
  return (
    <Popover.Content
      ref={ref}
      {...props}
      className={merge(
        "z-50 w-80 rounded-xs border border-gray-200 bg-background shadow-lg dark:border-gray-700",
        props.className,
      )}
    >
      {props.children}
    </Popover.Content>
  )
})
export const PopoverArrow = React.forwardRef<SVGSVGElement, Popover.PopperArrowProps>(function Arrow(props, ref) {
  return (
    <Popover.Arrow
      ref={ref}
      {...props}
      className={merge("fill-white text-white dark:fill-gray-700 dark:text-gray-700", props.className)}
    />
  )
})
export const PopoverPortal = React.forwardRef<SVGSVGElement, Popover.PortalProps>(function Arrow(props) {
  return <Popover.Portal {...props}>{props.children}</Popover.Portal>
})
