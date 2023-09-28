import { Link } from "@remix-run/react"
import { BadgeX, Verified } from "lucide-react"

import { type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { Avatar } from "../../../../components/ui/Avatar"

interface Props {
  spot: { verifiedAt: string | null } & {
    verifier: null | Pick<User, "avatar" | "avatarBlurHash" | "firstName" | "lastName" | "username">
  }
}

export function VerifiedCard({ spot }: Props) {
  return (
    <div className="@container">
      <div className="@lg:h-16 rounded-xs flex h-12 items-center border border-gray-200 dark:border-gray-700">
        {spot.verifiedAt && spot.verifier ? (
          <Link
            to={`/${spot.verifier.username}`}
            className="flex w-full flex-row items-center justify-between whitespace-nowrap px-4 hover:opacity-70"
          >
            <div>
              <div className="flex items-center space-x-1">
                <Verified className="sq-5" />
                <p className="@lg:text-lg @md:text-base text-sm">
                  Verified by{" "}
                  <span className="font-medium">
                    {spot.verifier.firstName} {spot.verifier.lastName}
                  </span>
                </p>
              </div>
              {/* <p className="text-sm">{spot.verifier.username}</p> */}
            </div>
            <div className="block">
              <Avatar
                className="sq-8 @lg:sq-10"
                size={40}
                placeholder={spot.verifier.avatarBlurHash}
                src={createImageUrl(spot.verifier.avatar)}
              />
            </div>
          </Link>
        ) : (
          <div className="@lg:text-lg flex items-center space-x-1 px-4 text-base">
            <BadgeX className="sq-5" />
            <p>Unverified</p>
          </div>
        )}
      </div>
    </div>
  )
}
