import type { Spot } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"
import type { SerializeFrom } from "@remix-run/node"
import { Link } from "@remix-run/react"
import { Camera, Star } from "lucide-react"

interface Props {
  spot: SerializeFrom<Pick<Spot, "id" | "name" | "address"> & { rating?: number; image?: string | null }>
}

export function SpotItem({ spot }: Props) {
  return (
    <Link to={`/spots/${spot.id}`} key={spot.id} className="flex items-center space-x-2 hover:opacity-70">
      {spot.image ? (
        <img
          alt="spot"
          width={200}
          height={100}
          className="h-[100px] min-w-[200px] rounded-md bg-gray-50 object-cover dark:bg-gray-700"
          src={createImageUrl(spot.image)}
        />
      ) : (
        <div className="flex h-[100px] min-w-[200px] items-center justify-center rounded-md bg-gray-50 object-cover dark:bg-gray-700">
          <Camera className="opacity-50" />
        </div>
      )}

      <div>
        <p className="text-2xl">{spot.name}</p>
        {spot.rating && (
          <div className="flex space-x-1">
            <Star className="sq-5" />
            <p>{spot.rating === null ? "Not rated" : spot.rating}</p>
          </div>
        )}
        <p className="text-sm font-thin opacity-70">{spot.address}</p>
      </div>
    </Link>
  )
}
