import { Image, type ImageProps } from "expo-image"

import { WEB_URL } from "../../lib/config"

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj["

type Fit = "cover" | "contain" | "fill" | "inside" | "outside"

type Options = {
  width?: number
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
  return <Image placeholder={blurhash} {...props} source={{ uri: newSrc }} />
}

export function transformImageSrc(src: string | undefined | null, options: Options) {
  if (!src) return undefined

  return (
    WEB_URL +
    "/api/image/?src=" +
    encodeURIComponent(src) +
    `&width=${options.width || ""}&height=${options.height || ""}&quality=${options.quality || "90"}&fit=${
      options.fit || "cover"
    }`
  )
}
