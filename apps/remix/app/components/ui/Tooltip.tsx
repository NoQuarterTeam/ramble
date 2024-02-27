"use client"
import * as RTooltip from "@radix-ui/react-tooltip"
import type * as React from "react"

interface Props {
  children: React.ReactNode
  label: React.ReactNode
  side?: RTooltip.TooltipContentProps["side"]
}

export function Tooltip(props: Props) {
  return (
    <RTooltip.Root delayDuration={200}>
      <RTooltip.Trigger asChild>{props.children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          className="rounded-xs z-[1000] bg-gray-900 px-1.5 py-0.5 text-sm text-white shadow-md dark:bg-gray-600"
          side={props.side}
          sideOffset={5}
        >
          {props.label}
          <RTooltip.Arrow className="fill-gray-900 dark:fill-gray-600" />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  )
}
