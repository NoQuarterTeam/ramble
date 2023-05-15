import { ListObjectsCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { s3Bucket, s3Region } from "@ramble/shared"

import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "~/lib/config.server"

const client = new S3Client({
  region: s3Region,
  credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
})

export function createSignedUrl(key: string) {
  const command = new PutObjectCommand({ Bucket: s3Bucket, Key: key, ACL: "public-read" })
  return getSignedUrl(client, command, { expiresIn: 3600 })
}

export function getImages() {
  const command = new ListObjectsCommand({ Bucket: s3Bucket })
  return client.send(command)
}
