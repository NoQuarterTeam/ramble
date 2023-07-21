import { Link } from "@remix-run/react"
import { BadgeX, Verified } from "lucide-react"

import { type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { Avatar } from "./ui/Avatar"

interface Props {
  spot: { verifiedAt: string | null } & {
    verifier: null | Pick<User, "avatar" | "avatarBlurHash" | "firstName" | "lastName" | "username">
  }
}

export function VerifiedCard({ spot }: Props) {
  return (
    <>
      {spot.verifiedAt && spot.verifier ? (
        <Link
          to={`/${spot.verifier.username}`}
          className=" flex flex-row items-center justify-between whitespace-nowrap rounded border border-gray-200 p-3 px-4 text-sm hover:opacity-70 dark:border-gray-700"
        >
          <div>
            <div className="flex items-center space-x-1">
              <Verified className="sq-5" />
              <p className="text-lg">
                Verified by{" "}
                <span className="font-medium">
                  {spot.verifier.firstName} {spot.verifier.lastName}
                </span>
              </p>
            </div>
            {/* <p className="text-sm">{spot.verifier.username}</p> */}
          </div>

          <div>
            <Avatar
              size={40}
              placeholder={spot.verifier.avatarBlurHash}
              src={createImageUrl(spot.verifier.avatar)}
              name={`${spot.verifier.firstName} ${spot.verifier.lastName}`}
            />
          </div>
        </Link>
      ) : (
        <div className="flex items-center space-x-1 text-sm">
          <BadgeX className="sq-5" />
          <p>Unverified</p>
        </div>
      )}
    </>
  )
}
