"use client"
import * as React from "react"
import * as Popover from "@radix-ui/react-popover"

import { merge } from "@ramble/shared"

export * from "@radix-ui/react-popover"

export const PopoverContent = React.forwardRef<HTMLDivElement, Popover.PopoverContentProps>(function _Content(props, ref) {
  return (
    <Popover.Content
      ref={ref}
      {...props}
      className={merge(
        "bg-background rounded-xs z-50 w-80 border border-gray-100 shadow-lg dark:border-gray-600",
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
