"use client"
import type * as React from "react"
import * as Tooltip from "@radix-ui/react-tooltip"

export function TooltipProvider(props: { children: React.ReactNode }) {
  return <Tooltip.Provider>{props.children}</Tooltip.Provider>
}
