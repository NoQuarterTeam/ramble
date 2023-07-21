"use client"
import * as React from "react"
import { v4 } from "uuid"

import { assetPrefix } from "@ramble/shared"

export type UploadFile = {
  fileUrl: string
  fileKey: string
  fileName: string
}

export function useS3Upload(): [(file: File) => Promise<{ key: string }>, { isLoading: boolean }] {
  const [isLoading, setIsLoading] = React.useState(false)

  async function upload(file: File) {
    try {
      setIsLoading(true)
      const key = v4()
      const formData = new FormData()
      formData.append("key", assetPrefix + key)
      const res = await fetch("/api/s3/createSignedUrl", { method: "post", body: formData })
      const signedUrl = (await res.json()) as string
      if (!signedUrl) throw new Error("Error fetching signed url")
      await fetch(signedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file })
      setIsLoading(false)
      return { key }
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  return [upload, { isLoading }]
}
