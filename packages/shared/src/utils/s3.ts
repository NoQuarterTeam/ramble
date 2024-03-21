export const s3Region = "eu-central-1"
export const s3Bucket = "ramble"

export const assetPrefix = "assets/"

export const s3Url = `https://${s3Bucket}.s3.amazonaws.com/`

export function createS3Url(path: string): string
export function createS3Url(path: string | null | undefined): string | undefined
export function createS3Url(path: string | null | undefined): string | undefined {
  return path ? (path.startsWith("http") ? path : s3Url + path) : undefined
}
