"use client"
import * as React from "react"
import dayjs from "dayjs"

export const formatFileName = (filename: string): string => {
  const type = filename.split(".").pop()
  let name = filename
    .split(".")[0]
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
  name = dayjs().format("YYYYMMDDHHmmss") + "-" + name
  if (type) {
    name = name + "." + type.toLowerCase()
  }
  return name
}

interface Props {
  path?: string
}

export type UploadFile = {
  fileUrl: string
  fileKey: string
  fileName: string
}
export function useS3Upload(props?: Props): [(file: File, lazyProps?: Props) => Promise<UploadFile>, { isLoading: boolean }] {
  const [isLoading, setIsLoading] = React.useState(false)

  async function upload(file: File, lazyProps?: Props) {
    try {
      setIsLoading(true)
      let formattedKey = props?.path || lazyProps?.path || "/"
      if (formattedKey[formattedKey.length - 1] === "/") {
        formattedKey = formattedKey.slice(0, -1)
      }
      if (formattedKey[0] === "/") {
        formattedKey = formattedKey.substring(1)
      }
      const formattedName = formatFileName(file.name)
      const key = formattedKey + "/" + formattedName

      const formData = new FormData()
      formData.append("key", key)
      const res = await fetch("/api/s3/createSignedUrl", {
        method: "post",
        body: formData,
      })
      const signedUrl = (await res.json()) as string
      if (!signedUrl) throw new Error("Error fetching signed url")
      await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })
      setIsLoading(false)
      return {
        fileUrl: signedUrl,
        fileKey: key,
        fileName: file.name,
        fileType: file.type || null,
      }
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  return [upload, { isLoading }]
}
