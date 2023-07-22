"use client"

import { merge } from "@ramble/shared"

import type { OptimizedImageProps } from "../OptimisedImage"
import { OptimizedImage } from "../OptimisedImage"
import { User2 } from "lucide-react"

interface Props extends Omit<OptimizedImageProps, "height" | "width" | "alt"> {
  size?: number
}

export function Avatar({ size = 100, src, ...props }: Props) {
  if (!src)
    return (
      <div
        className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-full justify-center"
        style={{ width: size, height: size }}
      >
        <User2 size={16} />
      </div>
    )
  return (
    <OptimizedImage
      src={src}
      width={size}
      height={size}
      alt="avatar"
      {...props}
      className={merge(props.className, "rounded-full")}
    />
  )
}
