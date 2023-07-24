import * as React from "react"
import { decode } from "blurhash"

import { merge } from "@ramble/shared"

type Fit = "cover" | "contain" | "fill" | "inside" | "outside"

export interface OptimizedImageProps extends Omit<React.ComponentPropsWithoutRef<"img">, "placeholder"> {
  height: number
  width: number
  alt: string
  quality?: number
  fit?: Fit
  placeholder?: string | null
}

export const transformImageSrc = (
  src: string | undefined | null,
  options: { width: number; height: number; quality?: number; fit?: Fit },
) =>
  src
    ? "/api/image/?src=" +
      encodeURIComponent(src) +
      `&width=${options.width || ""}&height=${options.height || ""}&quality=${options.quality || "90"}&fit=${
        options.fit || "cover"
      }`
    : undefined

export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(function _OptimizedImage(
  { src, quality, placeholder, fit, ...props }: OptimizedImageProps,
  ref,
) {
  // increase the width and height so quality is higher
  const newSrc = transformImageSrc(src, { width: props.width * 1.5, height: props.height * 1.5, quality, fit })
  return (
    <div className={merge("relative overflow-hidden", props.className)} style={{ height: props.height, width: props.width }}>
      {placeholder ? (
        <BlurCanvas blurHash={placeholder} />
      ) : (
        <div className="absolute rounded-md w-full h-full bg-gray-50 dark:bg-gray-700 animate-pulse" />
      )}
      <img
        ref={ref}
        {...props}
        className={merge("relative z-[1] w-full h-full object-cover", props.className)}
        alt={props.alt}
        src={newSrc}
      />
    </div>
  )
})

interface BlurCanvasProps {
  blurHash: string
}

function BlurCanvas(props: BlurCanvasProps) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  React.useEffect(() => {
    if (!ref.current) return
    const pixels = decode(props.blurHash, 32, 32)
    const ctx = ref.current.getContext("2d")
    if (!ctx) return
    const imageData = new ImageData(pixels, 32, 32)
    ctx.putImageData(imageData, 0, 0)
  }, [props.blurHash])

  return <canvas ref={ref} width={32} height={32} className="absolute w-full h-full" />
}
