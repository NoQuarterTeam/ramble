import { Link } from "@remix-run/react"
import { Camera, Star } from "lucide-react"

import type { SpotItemWithImageAndRating } from "@ramble/api/src/router/spot"
import { createImageUrl } from "@ramble/shared"

import { OptimizedImage } from "~/components/OptimisedImage"

interface Props {
  spot: SpotItemWithImageAndRating
}

export function SpotItem({ spot }: Props) {
  return (
    <Link to={`/spots/${spot.id}`} className="flex flex-col items-start space-x-2 hover:opacity-80 md:flex-row md:items-center">
      <div className="h-[250px] w-full md:h-[150px] md:w-[150px] md:min-w-[150px] md:max-w-[150px]">
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
      </div>

      <div>
        <p className="line-clamp-2 text-xl md:text-lg lg:text-xl">{spot.name}</p>
        {spot.rating && (
          <div className="flex items-center space-x-1">
            <Star className="sq-4" />
            <p>{spot.rating === null ? "Not rated" : spot.rating}</p>
          </div>
        )}
        <p className="text-sm font-thin opacity-70">{spot.address}</p>
      </div>
    </Link>
  )
}
