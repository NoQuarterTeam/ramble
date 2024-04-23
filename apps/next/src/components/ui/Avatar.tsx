"use client"

import { User2 } from "lucide-react"

import { merge } from "@ramble/shared"
import Image, { type ImageProps } from "next/image"

interface Props extends Omit<ImageProps, "height" | "width" | "alt"> {
  size?: number
}

export function Avatar({ size = 100, src, ...props }: Props) {
  if (!src)
    return (
      <div className={merge("center rounded-full bg-gray-50 dark:bg-gray-700", props.className)}>
        <User2 size={16} />
      </div>
    )
  return <Image src={src} width={size} height={size} alt="avatar" {...props} className={merge("rounded-full", props.className)} />
}
