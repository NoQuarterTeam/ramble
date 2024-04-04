import { assetUrl, defaultBlurHash } from "@ramble/shared"
import { Image, type ImageProps } from "expo-image"
import { FULL_WEB_URL } from "~/lib/config"

type Fit = "cover" | "contain" | "fill" | "inside" | "outside"

type Options = {
  width: number
  height?: number
  quality?: number
  fit?: Fit
}

interface Props extends ImageProps, Options {
  source: {
    uri: string | undefined
  }
}

export function OptimizedImage({ source, height, width, quality, fit, ...props }: Props) {
  const newSrc = transformImageSrc(source.uri, { height, width, quality, fit })
  return <Image {...props} placeholder={props.placeholder || defaultBlurHash} source={{ uri: newSrc }} />
}

export function transformImageSrc(src: string | undefined | null, options: Options) {
  if (!src) return undefined
  if (!src.startsWith(assetUrl)) return src
  const params = new URLSearchParams({
    src,
    width: options.width.toString(),
    height: options.height?.toString() || "",
    quality: options.quality?.toString() || "",
    fit: options.fit || "",
  })
  return `${FULL_WEB_URL}/api/image?${params}`
}
