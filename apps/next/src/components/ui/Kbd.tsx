import type * as React from "react"

export function Kbd(props: { children: React.ReactNode }) {
  return (
    <span className="whitesspanace-nowrap inline-block rounded-xs border border-black/20 border-b-4 bg-transparent px-1 font-medium font-mono text-xs dark:border-white/20">
      {props.children}
    </span>
  )
}
