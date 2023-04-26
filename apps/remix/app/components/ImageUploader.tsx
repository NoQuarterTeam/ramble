import * as React from "react"
import type { DropzoneOptions, FileRejection } from "react-dropzone"
import { useDropzone } from "react-dropzone"

import { merge, useDisclosure, useS3Upload } from "@travel/shared"
import { BrandButton, Button, ButtonGroup, inputStyles, Modal, useToast } from "@travel/ui"

interface Props {
  path: string
  onSubmit: (key: string) => Promise<unknown> | unknown
  children: React.ReactNode
  dropzoneOptions?: Omit<DropzoneOptions, "multiple" | "onDrop">
  className?: string
}

export function ImageUploader({ children, path, onSubmit, dropzoneOptions, className }: Props) {
  const modalProps = useDisclosure()
  const { toast } = useToast()
  const [image, setImage] = React.useState<{ file: File; preview: string } | null>(null)

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
      if (files.length === 0) return
      setImage({ file: files[0], preview: window.URL.createObjectURL(files[0]) })
      modalProps.onOpen()
    },
    [toast, dropzoneOptions, modalProps],
  )
  const { getRootProps, getInputProps } = useDropzone({
    maxSize: 5000000, // 5MB
    ...dropzoneOptions,
    onDrop,
    multiple: false,
  })
  const [upload, { isLoading }] = useS3Upload({ path })

  const handleSubmitImage = async () => {
    if (!image || !image.file) return
    try {
      const uploadedFile = await upload(image.file)
      await onSubmit(uploadedFile.fileKey)
      handleClose()
    } catch (error) {
      console.log(error)
      toast({ variant: "destructive", title: "Error uploading image", description: "Please try again!" })
    }
  }

  const handleClose = () => {
    modalProps.onClose()
    handleRemoveFile()
  }

  const handleRemoveFile = React.useCallback(() => {
    window.URL = window.URL || window.webkitURL
    if (image) window.URL.revokeObjectURL(image.preview)
  }, [image])

  React.useEffect(() => handleRemoveFile, [handleRemoveFile])

  return (
    <>
      <div className={merge(inputStyles(), className)} {...getRootProps()}>
        <input {...getInputProps()} />
        {children}
      </div>

      <Modal {...modalProps} onClose={handleClose} title="Confirm image">
        <div className="p-4">
          <img className="mb-4 max-h-[400px] w-full object-contain" alt="preview" src={image?.preview} />
          <ButtonGroup>
            <Button variant="ghost" disabled={isLoading} onClick={handleClose}>
              Cancel
            </Button>
            <BrandButton isLoading={isLoading} onClick={handleSubmitImage}>
              Submit
            </BrandButton>
          </ButtonGroup>
        </div>
      </Modal>
    </>
  )
}
