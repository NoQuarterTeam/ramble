import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { s3Bucket, s3Region } from "@ramble/shared"

import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "../lib/env"

const client = new S3Client({
  region: s3Region,
  credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
})

export function createSignedUrl(key: string) {
  const command = new PutObjectCommand({ Bucket: s3Bucket, Key: key, ACL: "public-read" })
  return getSignedUrl(client, command, { expiresIn: 3600 })
}

export function getObject(key: string) {
  const command = new GetObjectCommand({ Bucket: s3Bucket, Key: key })
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
