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
    <Link to={`/spots/${spot.id}`} className="flex flex-col items-start space-x-2 hover:opacity-70 md:flex-row md:items-center">
      <div className="h-[300px] w-full md:h-[100px] md:w-[150px]">
        {spot.image ? (
          <OptimizedImage
            alt="spot"
            placeholder={spot.blurHash}
            quality={90}
            width={450}
            height={300}
            className="rounded-md object-cover"
            src={createImageUrl(spot.image)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-50 object-cover dark:bg-gray-700">
            <Camera className="opacity-50" />
          </div>
        )}
      </div>

      <div>
        <p className="line-clamp-2 text-xl">{spot.name}</p>
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
