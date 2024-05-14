"use client"
import { Avatar, Button, IconButton, buttonStyles, iconbuttonStyles } from "@/components/ui"
import { TableCell, TableRow } from "@/components/ui/Table"
import type { Spot, SpotImage, User } from "@ramble/database/types"
import { createAssetUrl, merge, useDisclosure } from "@ramble/shared"
import dayjs from "dayjs"
import * as React from "react"

import { SpotIcon } from "@/components/SpotIcon"
import { ExternalLink, Eye, EyeOff, Trash } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { deleteSpot, verifySpot } from "./actions"

interface Props {
  spot: Pick<Spot, "type" | "sourceUrl" | "id" | "description" | "createdAt" | "name" | "latitude" | "longitude"> & {
    creator: Pick<User, "avatar" | "username">
    verifier: Pick<User, "avatar" | "username"> | null
    images: Pick<SpotImage, "id" | "path">[]
  }
}

export function SpotRow({ spot }: Props) {
  const expandProps = useDisclosure()
  const mapImageUrl = `https://api.mapbox.com/styles/v1/jclackett/clh82otfi00ay01r5bftedls1/static/geojson(%7B%22type%22%3A%22Point%22%2C%22coordinates%22%3A%5B${spot.longitude}%2C${spot.latitude}%5D%7D)/${spot.longitude},${spot.latitude},4/300x200@2x?access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`
  const [isVerifying, startVerify] = React.useTransition()
  const [isDeleting, startDelete] = React.useTransition()
  return (
    <React.Fragment key={spot.id}>
      <TableRow>
        <TableCell>
          <div className="flex items-center space-x-2">
            <div>
              <SpotIcon type={spot.type} size={16} />
            </div>
            <p className="line-clamp-1">{spot.name}</p>
          </div>
        </TableCell>
        <TableCell>
          <p className="line-clamp-1 max-w-md">{spot.description}</p>
        </TableCell>
        <TableCell>
          <div className="flex space-x-2 items-center">
            <div className="flex-shrink-0">
              <Avatar src={createAssetUrl(spot.creator.avatar)} size={30} className="h-7 w-7" />
            </div>
            <p>{spot.creator.username}</p>
          </div>
        </TableCell>
        <TableCell>
          {spot.verifier ? (
            <div className="flex space-x-2 items-center">
              <div className="flex-shrink-0">
                <Avatar src={createAssetUrl(spot.verifier.avatar)} size={30} className="h-7 w-7" />
              </div>
              <p>{spot.verifier.username}</p>
            </div>
          ) : (
            <Button
              size="xs"
              isLoading={isVerifying}
              onClick={() => {
                startVerify(async () => {
                  const success = await verifySpot(spot.id)
                  if (!success) toast.error("Failed to verify spot")
                })
              }}
            >
              Verify
            </Button>
          )}
        </TableCell>
        <TableCell>
          <p>{dayjs(spot.createdAt).format("DD/MM/YYYY")}</p>
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end">
            {spot.sourceUrl && (
              <Link
                href={spot.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={merge(
                  buttonStyles({ size: "sm", disabled: false, variant: "ghost" }),
                  iconbuttonStyles({ size: "sm" }),
                )}
              >
                <ExternalLink size={16} />
              </Link>
            )}
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="expand"
              onClick={expandProps.onToggle}
              icon={expandProps.isOpen ? <EyeOff size={16} /> : <Eye size={16} />}
            />
            <IconButton
              isLoading={isDeleting}
              onClick={() => {
                startDelete(async () => {
                  const success = await deleteSpot(spot.id)
                  if (success) toast.success("Spot deleted")
                  if (!success) toast.error("Failed to delete spot")
                })
              }}
              aria-label="delete"
              size="sm"
              variant="ghost"
              icon={<Trash className="text-red-500" size={16} />}
            />
          </div>
        </TableCell>
      </TableRow>
      {expandProps.isOpen && (
        <TableRow>
          <TableCell colSpan={6}>
            <div className="flex w-full gap-1 overflow-x-scroll">
              <div className="flex-shrink-0">
                <img height={200} width={300} className="h-[200px] w-[300px] rounded" alt="location" src={mapImageUrl} />
              </div>
              {spot.images.map((image) => (
                <Image
                  key={image.id}
                  unoptimized={image.path.startsWith("http")}
                  height={200}
                  width={300}
                  className="h-[200px] w-[300px] rounded-sm object-cover"
                  alt="spot"
                  src={createAssetUrl(image.path)}
                />
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  )
}
