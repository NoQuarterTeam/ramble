"use client"
import { Heart, Star } from "lucide-react"

import { type SpotItemType, displaySaved } from "@ramble/shared"
import { createAssetUrl, displayRating } from "@ramble/shared"
import Image from "next/image"
import { SpotIcon } from "./SpotIcon"

import { SaveSpot } from "./SaveSpot"

interface Props {
  spot: SpotItemType
}

export function SpotItem({ spot }: Props) {
  return (
    <div className="relative">
      <div className="space-y-2">
        <div className="relative h-[250px] w-full">
          {spot.image ? (
            <Image
              alt="spot"
              width={450}
              unoptimized={spot.image.startsWith("http")}
              height={300}
              className="h-full w-full rounded-xs object-cover"
              src={createAssetUrl(spot.image)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xs bg-gray-50 dark:bg-gray-800">
              <div className="rounded-full p-4">
                <SpotIcon type={spot.type} size={40} />
              </div>
            </div>
          )}
          {spot.image && (
            <div className="sq-10 absolute top-2 left-2 flex items-center justify-center rounded-full bg-background shadow">
              <SpotIcon type={spot.type} size={20} />
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-medium text-lg leading-tight">{spot.name}</p>
            <div className="flex items-center space-x-1.5">
              {spot.savedCount && spot.savedCount !== "0" && (
                <div className="flex items-center space-x-1">
                  <Heart className="sq-3 fill-black dark:fill-white" />
                  <p className="h-[18px] font-light text-sm">{displaySaved(spot.savedCount)}</p>
                </div>
              )}
              {spot.rating && spot.rating !== "0" && (
                <div className="flex items-center space-x-1">
                  <Star className="sq-3.5 fill-black dark:fill-white" />
                  <p className="h-[18px] font-light text-sm">{displayRating(spot.rating)}</p>
                </div>
              )}
            </div>
          </div>
          {spot.address && <p className="line-clamp-1 font-thin text-sm opacity-70">{spot.address}</p>}
        </div>
      </div>
      <div className="absolute top-2 right-2">
        <SaveSpot />
      </div>
    </div>
  )
}
