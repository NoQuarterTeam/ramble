import { HeadObjectCommand, NotFound, S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { env } from "@ramble/server-env"
import { assetUrl } from "@ramble/shared"

const REGION = "eu-central-1"
const S3_BUCKET = "ramble"

const client = new S3Client({
  region: REGION,
  credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY },
})

export async function upload(fileUrl: string, folder: string): Promise<string> {
  // imageUrl contains a load of aws stuff, so we need to extract the path to use as the key
  if (env.NODE_ENV === "development") return fileUrl
  const url = new URL(fileUrl)
  const key = folder + url.pathname
  const headCommand = new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key })
  // check if file exists, if it does this resolves, if not it throws an error
  await client.send(headCommand).catch(async (e) => {
    if (!(e instanceof NotFound)) throw e // if its not a not found error, throw it back up
    // if file doesn't exist, it will throw a not found error, so we upload it
    const res = await fetch(fileUrl)
    if (!res.body) throw new Error(`No file for key: ${key}`)
    const uploader = new Upload({
      client,
      params: { Bucket: S3_BUCKET, Key: key, Body: res.body, ACL: "public-read" },
    })
    await uploader.done()
  })
  const fullUrl = `${assetUrl}${key}`
  return fullUrl
}
