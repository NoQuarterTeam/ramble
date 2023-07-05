import * as React from "react"
import type { DropzoneOptions, FileRejection } from "react-dropzone"
import { useDropzone } from "react-dropzone"

import { Spinner, useToast } from "~/components/ui"
import { useS3Upload } from "~/lib/hooks/useS3"

interface Props {
  children: React.ReactNode
  dropzoneOptions?: Omit<DropzoneOptions, "multiple" | "onDrop">
  className?: string
}

type MultiSubmit = {
  isMulti: true
  onSubmit?: undefined
  onMultiSubmit: (keys: string[]) => Promise<unknown> | unknown
}

type SingleSubmit = {
  isMulti?: false
  onMultiSubmit?: undefined
  onSubmit: (key: string) => Promise<unknown> | unknown
}

export function ImageUploader({
  children,
  isMulti = false,
  onSubmit,
  onMultiSubmit,
  dropzoneOptions,
  className,
}: Props & (MultiSubmit | SingleSubmit)) {
  const { toast } = useToast()
  const [upload, { isLoading }] = useS3Upload()

  const handleSubmitImages = React.useCallback(
    async (images: File[]) => {
      try {
        if (isMulti) {
          const keys = await Promise.all(images.map(upload))
          await onMultiSubmit?.(keys.map((k) => k.key))
        } else {
          const { key } = await upload(images[0])
          await onSubmit?.(key)
        }
      } catch {
        toast({ variant: "destructive", title: "Error uploading image", description: "Please try again!" })
      }
    },
    [onSubmit, upload, toast, isMulti, onMultiSubmit],
  )

  const onDrop = React.useCallback(
    (files: File[], rejectedFiles: FileRejection[]) => {
      window.URL = window.URL || window.webkitURL
      if (rejectedFiles.length > 0) {
        const rejectedFile = rejectedFiles[0]
        if (rejectedFile.errors[0]?.code.includes("file-too-large")) {
          const description = `File too large, must be under ${
            (dropzoneOptions?.maxSize && `${dropzoneOptions.maxSize / 1000000}MB`) || "5MB"
          }`
          toast({ variant: "destructive", title: "Invalid file", description })
        } else {
          // TODO: add remaining error handlers
          toast({ variant: "destructive", description: "Invalid file, please try another" })
        }
        return
      }
      if (files.length === 0) return toast({ variant: "destructive", description: "No file, please add one" })

      return handleSubmitImages(files)
    },
    [toast, dropzoneOptions, handleSubmitImages],
  )
  const { getRootProps, getInputProps } = useDropzone({
    maxSize: 5000000, // 5MB
    ...dropzoneOptions,
    onDrop,
    multiple: isMulti,
  })

  return (
    <div {...getRootProps({ className })}>
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <input {...getInputProps()} />
          {children}
        </>
      )}
    </div>
  )
}
