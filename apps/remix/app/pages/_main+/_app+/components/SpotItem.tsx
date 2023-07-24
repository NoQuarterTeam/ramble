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
    <Link to={`/spots/${spot.id}`} className="flex items-center space-x-2 hover:opacity-70">
      {spot.image ? (
        <OptimizedImage
          alt="spot"
          placeholder={spot.blurHash}
          quality={90}
          width={150}
          height={100}
          className="h-[100px] min-w-[150px] rounded-md"
          src={createImageUrl(spot.image)}
        />
      ) : (
        <div className="flex h-[100px] min-w-[150px] items-center justify-center rounded-md bg-gray-50 object-cover dark:bg-gray-700">
          <Camera className="opacity-50" />
        </div>
      )}

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
