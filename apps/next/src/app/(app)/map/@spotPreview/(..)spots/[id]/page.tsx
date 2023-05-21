import type * as React from "react"
import { cache } from "react"
import { Star, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { createImageUrl, merge } from "@ramble/shared"
import { Avatar } from "@ramble/ui"

import { db } from "~/lib/db"

export const revalidate = 60 * 60 * 24 // 24 hours

export const getSpot = cache(async (id: string) => {
  const [spot, rating] = await Promise.all([
    db.spot.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        images: { select: { id: true, path: true } },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            createdAt: true,
            rating: true,
            description: true,
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
      },
    }),
    db.review.aggregate({ where: { spotId: id }, _avg: { rating: true } }),
  ])

  return { ...spot, rating: rating._avg.rating }
})

export default async function SpotPreview({ params: { id } }: { params: { id: string } }) {
  console.log("the fuck")

  const spot = await getSpot(id)
  return (
    <SpotContainer>
      <div className="space-y-6">
        <div className="space-y-2">
          <Link target="_blank" rel="noopener norefer" href={`/spots/${spot.id}`} className="text-lg hover:underline">
            {spot.name}
          </Link>
          <div className="hstack">
            <Star className="sq-5" />
            <p>{spot.rating?.toFixed(1) || "Not yet rated"}</p>
          </div>
          <p className="text-sm">{spot.address}</p>
          <div className="relative flex h-[225px] space-x-2 overflow-scroll">
            {spot.images?.map((image, i) => (
              <Image
                alt="spot"
                width={350}
                height={225}
                className="rounded-md"
                key={image.id}
                src={`${image.path}?${spot.id}${i}`}
              />
            ))}
          </div>
          <p className="text-sm">{spot.description}</p>
        </div>
        <hr />
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Reviews</h2>
          <div className="space-y-6">
            {spot.reviews?.map((review) => (
              <div key={review.id} className="stack space-y-2 rounded-md border border-gray-50 px-4 py-3 dark:border-gray-700">
                <div className="flex justify-between">
                  <div className="hstack">
                    <Avatar
                      className="sq-10 rounded-full"
                      name={`${review.user.firstName} ${review.user.lastName}`}
                      src={createImageUrl(review.user.avatar)}
                    />
                    <div>
                      <p className="text-md">
                        {review.user.firstName} {review.user.lastName}
                      </p>
                      <p className="text-sm opacity-70">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="hstack">
                    <Star className="sq-5" />
                    <p>{review.rating}</p>
                  </div>
                </div>
                <p className="text-sm">{review.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SpotContainer>
  )
}

// function SpotFallback() {
//   return (
//     <div className="space-y-2">
//       <Skeleton className="h-8 w-4/5" />
//       <Skeleton className="h-6 w-10" />
//       <Skeleton className="h-5 w-40" />
//       <div className="flex h-[225px] w-full space-x-2 overflow-hidden">
//         <Skeleton className="h-[225px] min-w-[350px] rounded" />
//         <Skeleton className="h-[225px] min-w-[350px] rounded" />
//       </div>
//       <Skeleton className="h-8 w-20" />
//       <Skeleton className="h-40 w-full" />
//       <Skeleton className="h-40 w-full" />
//       <Skeleton className="h-40 w-full" />
//     </div>
//   )
// }
export function Skeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={merge("animate-pulse rounded-md bg-gray-100 dark:bg-gray-700", props.className)} />
}

function SpotContainer(props: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 top-0 z-[1000] w-full max-w-[400px] overflow-scroll border-r border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <Link href={`/map`}>
        <X className="absolute right-2 top-2 z-10" />
      </Link>
      {props.children}
    </div>
  )
}
