import { Link, useLocation, useNavigate } from "@remix-run/react"
import { Heart, Star } from "lucide-react"

import { type SpotItemType, displaySaved } from "@ramble/shared"
import { createS3Url, displayRating } from "@ramble/shared"

import { OptimizedImage } from "~/components/OptimisedImage"
import { SpotIcon } from "~/components/SpotIcon"
import { IconButton } from "~/components/ui"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { SaveToList } from "~/pages/api+/spots+/$id.save-to-list"

interface Props {
  spot: SpotItemType
}

export function SpotItem({ spot }: Props) {
  const currentUser = useMaybeUser()
  const navigate = useNavigate()
  const pathname = useLocation().pathname
  return (
    <div className="relative">
      <Link prefetch="intent" to={`/spots/${spot.id}`} className="space-y-2 hover:opacity-80">
        <div className="relative h-[250px] w-full">
          {spot.image ? (
            <OptimizedImage
              alt="spot"
              placeholder={spot.blurHash}
              width={450}
              height={300}
              className="h-full w-full rounded-xs"
              src={createS3Url(spot.image)}
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
          {spot.distanceFromMe && <p className="font-thin text-sm opacity-70">{Math.round(spot.distanceFromMe)} km away</p>}
        </div>
      </Link>
      <div className="absolute top-2 right-2">
        {currentUser ? (
          <SaveToList
            spotId={spot.id}
            trigger={
              <IconButton
                className="rounded-full bg-background hover:bg-background dark:hover:opacity-80 hover:opacity-90"
                aria-label="save to list"
                icon={<Heart size={16} />}
              />
            }
          />
        ) : (
          <IconButton
            className="rounded-full bg-background hover:bg-background dark:hover:opacity-80 hover:opacity-90"
            aria-label="save to list"
            onClick={() => navigate(`/login?redirectTo=${pathname}`)}
            icon={<Heart size={16} />}
          />
        )}
      </div>
    </div>
  )
}
