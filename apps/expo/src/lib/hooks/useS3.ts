import * as React from "react"
import "react-native-get-random-values"
import { v4 } from "uuid"

import { assetPrefix } from "@ramble/shared"

import { api } from "../api"

export function useS3Upload(): [(fileUrl: string) => Promise<string>, { isLoading: boolean }] {
  const [isLoading, setIsLoading] = React.useState(false)
  const { mutateAsync } = api.s3.createSignedUrl.useMutation()
  async function upload(fileUrl: string) {
    try {
      setIsLoading(true)
      const type = fileUrl.split(".").pop()?.toLowerCase()
      const key = `${assetPrefix}${v4()}.${type}`
      const res = await mutateAsync({ key })
      const resp = await fetch(fileUrl)
      const imageBody = await resp.blob()
      await fetch(res, { method: "PUT", body: imageBody })
      setIsLoading(false)
      return key
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  return [upload, { isLoading }]
}

export function useS3QuickUpload() {
  const { mutateAsync } = api.s3.createSignedUrl.useMutation()
  async function upload(fileUrl: string) {
    const type = fileUrl.split(".").pop()?.toLowerCase()
    const key = `${assetPrefix}${v4()}.${type}`
    const res = await mutateAsync({ key })
    const resp = await fetch(fileUrl)
    const imageBody = await resp.blob()
    await fetch(res, { method: "PUT", body: imageBody })
    return key
  }
  return upload
}
