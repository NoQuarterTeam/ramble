export const s3Region = "eu-central-1"
export const s3Bucket = "ramble"

export const assetPrefix = `assets/`

export const s3Url = `https://${s3Bucket}.s3.amazonaws.com/`

export const createImageUrl = (path?: string | null) =>
  path ? (path.startsWith("http") ? path : s3Url + assetPrefix + path) : undefined
