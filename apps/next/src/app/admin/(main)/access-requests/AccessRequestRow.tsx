"use client"
import { IconButton } from "@/components/ui"
import { TableCell, TableRow } from "@/components/ui/Table"
import type { AccessRequest, User } from "@ramble/database/types"
import dayjs from "dayjs"
import { Check, Trash } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"
import { acceptRequest, deleteRequest } from "./actions"

interface Props {
  accessRequest: Pick<AccessRequest, "id" | "email" | "createdAt" | "acceptedAt" | "code"> & {
    user: Pick<User, "createdAt"> | null
  }
}

export function AccessRequestRow({ accessRequest }: Props) {
  const [isVerifying, startVerify] = React.useTransition()
  const [isDeleting, startDelete] = React.useTransition()
  return (
    <TableRow>
      <TableCell>
        <p>{accessRequest.email}</p>
      </TableCell>
      <TableCell>
        <p>{accessRequest.code}</p>
      </TableCell>
      <TableCell>
        <p>{dayjs(accessRequest.createdAt).format("DD/MM/YYYY")}</p>
      </TableCell>
      <TableCell>{accessRequest.acceptedAt && <p>{dayjs(accessRequest.acceptedAt).format("DD/MM/YYYY")}</p>}</TableCell>

      <TableCell>{accessRequest.user && <p>{dayjs(accessRequest.user.createdAt).format("DD/MM/YYYY")}</p>}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center space-x-2 justify-end">
          {!accessRequest.user && !accessRequest.acceptedAt && (
            <IconButton
              isLoading={isVerifying}
              variant="outline"
              aria-label="accept"
              size="sm"
              onClick={() => {
                startVerify(async () => {
                  const success = await acceptRequest(accessRequest.id)
                  if (!success) toast.error("Failed to accept request")
                })
              }}
              icon={<Check size={16} />}
            />
          )}
          {!accessRequest.acceptedAt && (
            <IconButton
              isLoading={isDeleting}
              aria-label="delete"
              onClick={() => {
                startDelete(async () => {
                  const success = await deleteRequest(accessRequest.id)
                  if (!success) toast.error("Failed to delete request")
                })
              }}
              size="sm"
              variant="ghost"
              icon={<Trash className="text-red-500" size={16} />}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
