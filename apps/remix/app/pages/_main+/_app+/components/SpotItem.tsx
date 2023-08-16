import { Link } from "@remix-run/react"
import { Camera, Star } from "lucide-react"

import type { SpotItemWithImageAndRating } from "@ramble/api/src/router/spot"
import { createImageUrl } from "@ramble/shared"

import { OptimizedImage } from "~/components/OptimisedImage"
import { SPOTS } from "~/lib/static/spots"

interface Props {
  spot: SpotItemWithImageAndRating
}

export function SpotItem({ spot }: Props) {
  const Icon = SPOTS[spot.type].Icon
  return (
    <Link to={`/spots/${spot.id}`} className="flex flex-col items-start space-x-2 hover:opacity-80 ">
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

      <div>
        <p className="line-clamp-2 py-1 text-lg">{spot.name}</p>
        <div className="flex items-center space-x-1 text-sm">
          <Star className="sq-4" />
          <p>{spot.rating === null ? "Not rated" : spot.rating}</p>
        </div>

        <p className="line-clamp-1 text-sm font-thin opacity-70">{spot.address}</p>
      </div>
    </Link>
  )
}
