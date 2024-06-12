import { join } from "@ramble/shared"
import { type VariantProps, cva } from "class-variance-authority"
import type * as React from "react"

const tags = cva("text-sm px-3 py-1 flex items-center justify-center rounded-full", {
  variants: {
    color: {
      default: "text-white bg-gray-700",
      blue: "text-blue-200 bg-blue-900",
      brown: "text-amber-200 bg-amber-900",
      gray: "text-gray-200 bg-stone-700",
      green: "text-green-200 bg-green-900",
      orange: "text-orange-200 bg-orange-900",
      pink: "text-pink-200 bg-pink-900",
      purple: "text-purple-200 bg-purple-900",
      red: "text-red-200 bg-red-900",
      yellow: "text-yellow-200 bg-yellow-900",
    },
  },
  defaultVariants: {
    color: "default",
  },
})

export type TagProps = VariantProps<typeof tags>

interface Props {
  children?: React.ReactNode
  tag: {
    id: string
    name: string
    color: TagProps["color"]
  }
}

export function Tag(props: Props) {
  return (
    <div className={join(tags({ color: props.tag.color }))}>
      <span className="pt-px">{props.tag.name}</span>
    </div>
  )
}
