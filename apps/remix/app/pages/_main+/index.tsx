import { Link, useLoaderData } from "@remix-run/react"
import { json } from "@vercel/remix"
import { Camera, Star } from "lucide-react"

import { type SpotItemWithImageAndRating } from "@ramble/api/src/router/spot"
import { createImageUrl } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { OptimizedImage } from "~/components/OptimisedImage"
import { Badge } from "~/components/ui"
import { db } from "~/lib/db.server"

import { PageContainer } from "../../components/PageContainer"

export const config = {
  runtime: "edge",
}

export const loader = async () => {
  const spots: Array<SpotItemWithImageAndRating> = await db.$queryRaw`
      SELECT 
        Spot.id, Spot.name, Spot.address, AVG(Review.rating) as rating,
        (SELECT path FROM SpotImage WHERE SpotImage.spotId = Spot.id LIMIT 1) AS image,
        (SELECT blurHash FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS blurHash
      FROM
        Spot
      LEFT JOIN
        Review ON Spot.id = Review.spotId
      GROUP BY
        Spot.id
      ORDER BY
        rating DESC, Spot.id
      LIMIT 5;
    `
  return json(spots)
}

export default function Home() {
  const spots = useLoaderData<typeof loader>()
  return (
    <div>
      <PageContainer>
        <div className="grid grid-cols-1 gap-6 py-10 md:grid-cols-9 md:py-32">
          <div className="col-span-9 space-y-2 md:col-span-6">
            <Badge colorScheme="green">Coming soon</Badge>
            <h1 className="text-4xl font-medium">Everything you need for travelling Europe</h1>
            <p className="text-2xl">1000's of spots, service stations, cafes, parks and more</p>
            <LinkButton size="lg" to="map" className="max-w-min">
              Start exploring
            </LinkButton>
          </div>
          <div className="col-span-9 md:col-span-3">
            <img
              src="/landing/hero.jpg"
              width={400}
              height={400}
              alt="two vans in the forest"
              className="sq-[400px] rounded-md object-cover"
            />
          </div>
        </div>

        <div className="max-w-3xl space-y-4 pb-40">
          <h2 className="text-2xl">What is Ramble?</h2>
          <p>
            Ramble is more than just a platform for finding camper spots. It's a comprehensive guide to nomadic life, designed
            with remote workers, travellers, and outdoor sports enthusiasts in mind. Whether you're a climber, mountain biker,
            SUP-er, or just someone who loves exploring new places, Ramble has something for you.
          </p>
        </div>

        <h2 className="text-2xl">Check out some top rated spots</h2>
        <div className="scrollbar-hide flex space-x-4 overflow-x-scroll py-4">
          {spots.map((spot) => (
            <Link to={`/spots/${spot.id}`} key={spot.id} className="w-[450px] flex-shrink-0 hover:opacity-70">
              {spot.image ? (
                <OptimizedImage
                  alt="spot"
                  width={450}
                  height={250}
                  className="min-h-[250px] min-w-[450px] rounded-md bg-gray-50 object-cover dark:bg-gray-700"
                  src={createImageUrl(spot.image)}
                />
              ) : (
                <div className="flex h-[250px] min-w-[450px] items-center justify-center rounded-md bg-gray-50 object-cover dark:bg-gray-700">
                  <Camera size={70} className="opacity-50" />
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
          ))}
        </div>

        {/* <div className="flex flex-col items-center justify-center py-20">
        <h2>Plan a trip</h2>
        <img
          src="/landing/landing-1.jpg"
          width={400}
          height={200}
          alt="van at campside"
          className="w-[400px] rounded-md object-cover"
        />
      </div> */}
      </PageContainer>
      <div className="bg-gray-50 py-10 dark:bg-gray-950">
        <PageContainer>
          <h3>Ramble</h3>
        </PageContainer>
      </div>
    </div>
  )
}
