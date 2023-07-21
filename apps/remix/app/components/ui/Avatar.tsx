"use client"

import { merge } from "@ramble/shared"

import type { OptimizedImageProps } from "../OptimisedImage"
import { OptimizedImage } from "../OptimisedImage"

interface Props extends Omit<OptimizedImageProps, "height" | "width" | "alt"> {
  name: string
  size?: number
}

export function Avatar({ size = 100, src, placeholder, name, ...props }: Props) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")

  if (!src)
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <p>{initials}</p>
      </div>
    )
  return (
    <OptimizedImage
      placeholder={placeholder}
      src={src}
      width={size}
      height={size}
      alt="avatar"
      {...props}
      className={merge(props.className, "rounded-full")}
    />
  )
}
