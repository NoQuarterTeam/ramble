import { Link } from "@remix-run/react"
import { Camera, Heart, Star } from "lucide-react"

import type { SpotItemWithStats } from "@ramble/api/src/router/spot"
import { createImageUrl, displayRating } from "@ramble/shared"

import { OptimizedImage } from "~/components/OptimisedImage"
import { SPOTS } from "~/lib/static/spots"

interface Props {
  spot: SpotItemWithStats
}

export function SpotItem({ spot }: Props) {
  const Icon = SPOTS[spot.type].Icon

  return (
    <Link to={`/spots/${spot.id}`} className="space-y-2 hover:opacity-80">
      <div className="relative h-[250px] w-full">
        {spot.image ? (
          <OptimizedImage
            alt="spot"
            placeholder={spot.blurHash}
            width={450}
            height={300}
            className="h-full w-full rounded-md"
            src={createImageUrl(spot.image)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-50 dark:bg-gray-700">
            <Camera className="opacity-50" />
          </div>
        )}
        <div className="sq-10 absolute left-2 top-2 flex items-center justify-center rounded-full bg-white shadow dark:bg-black">
          <Icon size={20} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="line-clamp-2 text-lg leading-tight">{spot.name}</p>
        <p className="line-clamp-1 text-sm font-thin opacity-70">{spot.address}</p>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm">
            <Star className="sq-4" />
            <p>{displayRating(spot.rating)}</p>
          </div>
          <div className="flex items-center space-x-1 text-sm">
            <Heart className="sq-4" />
            <p>{spot.savedCount}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
