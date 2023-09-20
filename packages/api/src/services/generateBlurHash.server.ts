import { encode } from "blurhash"
import sharp from "sharp"

import { createImageUrl } from "@ramble/shared"

export async function generateBlurHash(path: string) {
  try {
    const url = createImageUrl(path)
    if (!url) return null
    const res = await fetch(url)
    return encodeImageToBlurhash(await res.arrayBuffer()) as Promise<string>
  } catch (error) {
    console.log(error)
    console.log("Oops - generating blurhash failed")
    return null
  }
}

const encodeImageToBlurhash = (buffer: ArrayBuffer) =>
  new Promise((resolve, reject) => {
    sharp(buffer)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: "inside" })
      .toBuffer((err, buffer, { width, height }) => {
        if (err) return reject(err)
        resolve(encode(new Uint8ClampedArray(buffer), width, height, 4, 4))
      })
  })
