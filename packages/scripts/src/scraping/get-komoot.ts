import * as cheerio from "cheerio"

// mtb
const url = `https://www.komoot.com/api/v007/discover_tours/?srid=4326&format=simple&fields=timeline&timeline_highlights_fields=images,start_point&limit=100&max_distance=30000&sport=mtb&page=0&hl=en`

import exampleData from "./komoot.json"

import { prisma } from "@ramble/database"
import { SpotType } from "@ramble/database/types"

async function getCards({ lat, lng }: { lat: number; lng: number }) {
  const res = await fetch(url + `&lat=${lat}&lng=${lng}`)
  const newData = await res.json()
  const newSpots = newData._embedded.items as any[]
  console.log(newSpots[0])

  const dbSpots = await prisma.spot.findMany({
    select: { komootId: true },
    where: { type: "MOUNTAIN_BIKING", komootId: { in: newSpots.map((s) => parseInt(s.id)) } },
  })

  // number of new spots

  for (let index = 0; index < newSpots.length; index++) {
    const spot = newSpots[index]

    try {
      // if in db, continue
      const exists = dbSpots.find((s) => s.komootId === spot.id)

      if (exists) continue
      const data = {
        type: SpotType.MOUNTAIN_BIKING,
        komootId: spot.id,
        address: spot.address.street + ", " + spot.address.city + ", " + spot.address.country + ", " + spot.address.zipcode,
        name: spot.title_short.replace(/^\(\d+\)\s*/, "").trim(),
        createdAt: new Date(spot.created_at),
        description: spot.description,
        latitude: spot.lat,
        longitude: spot.lng,
      }

      const detailPage = await fetch(`https://www.komoot.com/smarttour/${spot.id}`)
      const text = await detailPage.text()

      const $ = cheerio.load(text)

      let images: string[] = []
      $(".css-1ganbmd").each((_, img) => {
        const src = $(img).attr("data-src")
        if (src) images.push(src.split("?")[0])
      })

      await prisma.spot.create({
        data: {
          ...data,
          images: {
            create: images.map((url) => ({ path: url, creator: { connect: { email: "george@noquarter.co" } } })),
          },
          creator: { connect: { email: "george@noquarter.co" } },
        },
      })
    } catch {}
  }
}

async function main() {
  try {
    // lat and lng coords of europe in large squares
    // 52.3759° N, 4.8975° E
    await getCards({ lat: 52.3759, lng: 4.8975 })
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main()
  .then(() => {
    console.log("Done!")
  })
  .finally(() => process.exit(0))
