import * as React from "react"
import type { DropzoneOptions, FileRejection } from "react-dropzone"
import { useDropzone } from "react-dropzone"

import { Spinner, useToast } from "~/components/ui"
import { useS3Upload } from "~/lib/hooks/useS3"

interface Props {
  onSubmit: (key: string) => Promise<unknown> | unknown
  children: React.ReactNode
  dropzoneOptions?: Omit<DropzoneOptions, "multiple" | "onDrop">
  className?: string
}

export function ImageUploader({ children, onSubmit, dropzoneOptions, className }: Props) {
  const { toast } = useToast()
  const [upload, { isLoading }] = useS3Upload()

  const handleSubmitImage = React.useCallback(
    async (image: File) => {
      try {
        const { key } = await upload(image)
        await onSubmit(key)
      } catch {
        toast({ variant: "destructive", title: "Error uploading image", description: "Please try again!" })
      }
    },
    [onSubmit, upload, toast],
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
      const image = files[0]
      handleSubmitImage(image)
    },
    [toast, dropzoneOptions, handleSubmitImage],
  )
  const { getRootProps, getInputProps } = useDropzone({
    maxSize: 5000000, // 5MB
    ...dropzoneOptions,
    onDrop,
    multiple: false,
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
