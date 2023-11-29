import { Link, useLocation, useNavigate } from "@remix-run/react"
import { Heart, Star } from "lucide-react"

import { type SpotItemWithStatsAndImage } from "@ramble/shared"
import { createImageUrl, displayRating } from "@ramble/shared"

import { OptimizedImage } from "~/components/OptimisedImage"
import { SpotIcon } from "~/components/SpotIcon"
import { IconButton } from "~/components/ui"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { SaveToList } from "~/pages/api+/save-to-list"

interface Props {
  spot: SpotItemWithStatsAndImage
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
              className="rounded-xs h-full w-full"
              src={createImageUrl(spot.image)}
            />
          ) : (
            <div className="rounded-xs flex h-full w-full items-center justify-center bg-gray-50 dark:bg-gray-800">
              <div className="rounded-full p-4">
                <SpotIcon type={spot.type} size={40} />
              </div>
            </div>
          )}
          {spot.image && (
            <div className="sq-10 bg-background absolute left-2 top-2 flex items-center justify-center rounded-full shadow">
              <SpotIcon type={spot.type} size={20} />
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <p className="line-clamp-2 truncate text-lg leading-tight">{spot.name}</p>
          <p className="line-clamp-1 text-sm font-thin opacity-70">{spot.address || "-"}</p>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="sq-4" />
              <p className="text-sm">{displayRating(spot.rating)}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="sq-4" />
              <p className="text-sm">{spot.savedCount}</p>
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute right-2 top-2">
        {currentUser ? (
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
        ) : (
          <IconButton
            className="bg-background hover:bg-background rounded-full hover:opacity-90 dark:hover:opacity-80"
            aria-label="save to list"
            onClick={() => navigate("/login?redirectTo=" + pathname)}
            icon={<Heart size={16} />}
          />
        )}
      </div>
    </div>
  )
}
