import { createFlickr } from "flickr-sdk"

import { FLICKR_ACCESS_KEY } from "./env"

export const { flickr } = createFlickr(FLICKR_ACCESS_KEY)

export type FlickrResponse =
  | { photos: { photo: { id: string; secret: string; owner: string; server: string }[] | undefined } | undefined }
  | undefined
