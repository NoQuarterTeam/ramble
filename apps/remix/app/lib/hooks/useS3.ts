"use client"
import * as React from "react"
import { useAuthenticityToken } from "remix-utils/csrf/react"

export type UploadFile = {
  fileUrl: string
  fileKey: string
  fileName: string
}

export function useS3Upload(): [(file: File) => Promise<string>, { isLoading: boolean }] {
  const [isLoading, setIsLoading] = React.useState(false)
  const csrf = useAuthenticityToken()
  async function upload(file: File) {
    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append("type", file.type.split("/").pop()!)
      formData.append("csrf", csrf)
      const res = await fetch("/api/s3/createSignedUrl", { method: "POST", body: formData })
      const { url, key } = (await res.json()) as { key: string; url: string }
      if (!url) throw new Error("Error fetching signed url")
      await fetch(url, { method: "PUT", headers: { "Content-Type": file.type }, body: file })
      setIsLoading(false)
      return key
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  return [upload, { isLoading }]
}
