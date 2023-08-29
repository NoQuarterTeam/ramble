import { useLoaderData } from "@remix-run/react"
import type { LinksFunction } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { type SpotItemWithStats } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { Badge } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import landingStyles from "~/styles/landing.css"

import { PageContainer } from "../../components/PageContainer"
import { SpotItem } from "./_app+/components/SpotItem"

export const config = {
  runtime: "edge",
  regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: landingStyles }]
}

export const headers = useLoaderHeaders

export const loader = async () => {
  const spots: Array<SpotItemWithStats> = await db.$queryRaw`
    SELECT 
      Spot.id, Spot.name, Spot.type, Spot.address, AVG(Review.rating) as rating,
      (SELECT path FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS image,
      (SELECT blurHash FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS blurHash,
      (CAST(COUNT(ListSpot.spotId) as CHAR(32))) AS savedCount
    FROM
      Spot
    LEFT JOIN
      Review ON Spot.id = Review.spotId
    LEFT JOIN
      ListSpot ON Spot.id = ListSpot.spotId
    WHERE
      Spot.deletedAt IS NULL
    GROUP BY
      Spot.id
    ORDER BY
      rating DESC, Spot.id
    LIMIT 5;
  `
  return json(spots, { headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1day", sMaxage: "1day" }) } })
}

export default function Home() {
  const spots = useLoaderData<typeof loader>()
  return (
    <div>
      <PageContainer className="space-y-20">
        <div className="grid grid-cols-1 gap-6 pb-10 pt-10 md:grid-cols-9 md:pb-20 md:pt-32">
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

        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl">What is Ramble?</h2>
          <p>
            Ramble is more than just a platform for finding camper spots. It's a comprehensive guide to nomadic life, designed
            with remote workers, travellers, and outdoor sports enthusiasts in mind. Whether you're a climber, mountain biker,
            SUP-er, or just someone who loves exploring new places, Ramble has something for you.
          </p>
        </div>

        <div className="space-y-4">
          {/* <h2 className="text-3xl">This is Ramble.</h2> */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="space-y-2 md:space-y-4">
              <img src={`/landing/8.png`} className="w-full rounded-md object-contain" alt="landing inspo" />
              <img src={`/landing/3.png`} className="w-full rounded-md object-contain" alt="landing inspo" />
              <img src={`/landing/1.png`} className="w-full rounded-md object-contain" alt="landing inspo" />
              <img src={`/landing/10.png`} className="w-full rounded-md object-contain" alt="landing inspo" />
            </div>
            <div className="space-y-2 md:space-y-4">
              <img src={`/landing/6.png`} className="w-full rounded-md object-contain" alt="landing inspo" />
              <img src={`/landing/9.png`} className="w-full rounded-md object-contain" alt="landing inspo" />
              <img src={`/landing/4.png`} className="w-full rounded-md object-contain" alt="landing inspo" />
            </div>
            <div className="space-y-2 md:space-y-4">
              <img src={`/landing/5.png`} className="w-full rounded-md object-contain" alt="landing inspo" />
              <img src={`/landing/7.png`} className="w-full rounded-md object-contain" alt="landing inspo" />
              <img src={`/landing/2.png`} className="w-full rounded-md object-contain" alt="landing inspo" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl">Check out some top rated spots</h2>
          <div className="scrollbar-hide flex space-x-3 overflow-x-scroll py-4">
            {spots.map((spot) => (
              <div key={spot.id} className="min-w-[350px]">
                <SpotItem spot={spot} />
              </div>
            ))}
          </div>
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
