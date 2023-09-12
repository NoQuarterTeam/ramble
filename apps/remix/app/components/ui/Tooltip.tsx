"use client"
import type * as React from "react"
import * as RTooltip from "@radix-ui/react-tooltip"

interface Props {
  children: React.ReactNode
  label: string
  side?: RTooltip.TooltipContentProps["side"]
}

export function Tooltip(props: Props) {
  return (
    <RTooltip.Root delayDuration={200}>
      <RTooltip.Trigger asChild>{props.children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          className="rounded-xsbg-gray-900 z-[1000] px-1.5 py-0.5 text-sm text-white shadow-md dark:bg-gray-600"
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
