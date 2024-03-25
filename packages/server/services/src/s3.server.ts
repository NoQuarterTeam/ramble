import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { env } from "@ramble/server-env"

export const assetPrefix = "assets/"

const s3Region = "eu-central-1"
const s3Bucket = "ramble"

const client = new S3Client({
  region: s3Region,
  credentials: { accessKeyId: env.AWS_ACCESS_KEY_ID, secretAccessKey: env.AWS_SECRET_ACCESS_KEY },
})

export function createSignedUrl(key: string) {
  const command = new PutObjectCommand({ Bucket: s3Bucket, Key: key, ACL: "public-read" })
  return getSignedUrl(client, command, { expiresIn: 3600 })
}

export function getObject(key: string) {
  const command = new GetObjectCommand({ Bucket: s3Bucket, Key: key })
  return client.send(command)
}
export function deleteObject(key: string) {
  const command = new DeleteObjectCommand({ Bucket: s3Bucket, Key: key })
  return client.send(command)
}
export function deleteManyObjects(keys: string[]) {
  const command = new DeleteObjectsCommand({ Bucket: s3Bucket, Delete: { Objects: keys.map((Key) => ({ Key })) } })
  return client.send(command)
}

export function getHead(key: string) {
  const command = new HeadObjectCommand({ Bucket: s3Bucket, Key: key })
  return client.send(command)
}

export async function uploadStream(key: string, body: ReadableStream) {
  const uploader = new Upload({
    client,
    params: { Bucket: s3Bucket, Key: key, Body: body, ACL: "public-read" },
  })
  await uploader.done()
}
