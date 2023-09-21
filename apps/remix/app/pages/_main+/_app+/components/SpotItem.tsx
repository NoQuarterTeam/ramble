import { Link } from "@remix-run/react"
import { Heart, Star } from "lucide-react"

import { type SpotItemWithStats } from "@ramble/shared"
import { createImageUrl, displayRating } from "@ramble/shared"

import { OptimizedImage } from "~/components/OptimisedImage"
import { IconButton } from "~/components/ui"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { SPOTS } from "~/lib/static/spots"
import { SaveToList } from "~/pages/api+/save-to-list"

interface Props {
  spot: SpotItemWithStats
}

export function SpotItem({ spot }: Props) {
  const Icon = SPOTS[spot.type].Icon
  const currentUser = useMaybeUser()

  return (
    <div className="relative">
      <Link to={`/spots/${spot.id}`} className="space-y-2 hover:opacity-80">
        <div className="relative h-[250px] w-full">
          {spot.image ? (
            <OptimizedImage
              alt="spot"
              placeholder={spot.blurHash}
              width={450}
              height={300}
              className="rounded-xs h-full w-full"
              src={createImageUrl(spot.image)}
            />
          ) : (
            <div className="rounded-xs flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800">
              <div className="bg-background rounded-full p-4">
                <Icon size={40} />
              </div>
            </div>
          )}
          {spot.image && (
            <div className="sq-10 bg-background absolute left-2 top-2 flex items-center justify-center rounded-full shadow">
              <Icon size={20} />
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <p className="line-clamp-2 text-base leading-tight">{spot.name}</p>
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
      {currentUser && (
        <div className="absolute right-2 top-2">
          <SaveToList
            spotId={spot.id}
            trigger={
              <IconButton
                className="bg-background hover:bg-background rounded-full hover:opacity-90 dark:hover:opacity-80"
                aria-label="save to list"
                icon={<Heart size={16} />}
              />
            }
          />
        </div>
      )}
    </div>
  )
}
