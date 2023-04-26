import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { AWS_ACCESS_KEY_USER, AWS_SECRET_KEY_USER } from "~/lib/config.server"
import { s3Bucket } from "~/lib/s3"

const REGION = "eu-central-1"

const client = new S3Client({
  region: REGION,
  credentials: { accessKeyId: AWS_ACCESS_KEY_USER, secretAccessKey: AWS_SECRET_KEY_USER },
})

export function createSignedUrl(key: string) {
  const command = new PutObjectCommand({ Bucket: s3Bucket, Key: key })
  return getSignedUrl(client, command, { expiresIn: 3600 })
}
