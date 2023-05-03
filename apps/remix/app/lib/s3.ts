export const s3Bucket = "nq-travel-dev"
export const s3Url = `https://${s3Bucket}.s3.amazonaws.com/`
export const createImageUrl = (path?: string | null) => (path ? s3Url + path : undefined)
