import * as cheerio from "cheerio"

// hiking
const url = `https://www.komoot.com/api/v007/discover_tours/?srid=4326&format=simple&fields=timeline&timeline_highlights_fields=images,start_point&limit=100&max_distance=500000&sport=hike&surface=prefer_unpaved&hl=en`

import exampleData from "./komoot.json"

import { prisma } from "@ramble/database"
import { SpotType } from "@ramble/database/types"

async function getCards({ lat, lng }: { lat: number; lng: number }) {
  const res = await fetch(url + `&lat=${lat}&lng=${lng}&page=0`)
  const newData = await res.json()
  const totalPages = newData.page.totalPages
  console.log("Total Pages: " + totalPages)

  for (let page = 0; page < totalPages; page++) {
    console.log("Page: " + (page + 1) + "/" + totalPages)

    const res = await fetch(url + `&lat=${lat}&lng=${lng}&page=${page}`)
    const newData = await res.json()
    const newSpots = newData?._embedded?.items as any[]
    console.log("Spots found: " + newSpots.length)
    const dbSpots = await prisma.spot.findMany({
      select: { komootId: true },
      where: { type: "HIKING", komootId: { in: newSpots?.map((s) => s.id) } },
    })

    // number of new spots

    for (let index = 0; index < newSpots.length; index++) {
      const spot = newSpots[index]
      console.log(
        "Adding spot: " + index + " out of " + newSpots.length + " - " + (page + 1) + "/" + totalPages + " - " + lat + "," + lng,
      )
      try {
        // if in db, continue
        const exists = dbSpots.find((s) => s.komootId === spot.id)
        console.log(exists ? "Spot already exists" : "...")

        if (exists) continue
        const data = {
          type: SpotType.HIKING,
          komootId: spot.id,
          name: spot.name,
          createdAt: new Date(spot.date),
          latitude: spot.start_point.lat,
          longitude: spot.start_point.lng,
        }

        const detailPage = await fetch(`https://www.komoot.com/smarttour/${spot.id}`)
        const text = await detailPage.text()

        const $ = cheerio.load(text)

        let images: string[] = []
        $(".css-1ganbmd .css-1sjk0s2").each((_, img) => {
          const src = $(img).attr("data-src")
          if (src) images.push(src.split("?")[0])
        })
        const uniqueImages = new Set(images)

        await prisma.spot.create({
          data: {
            ...data,
            images: {
              create:
                uniqueImages &&
                Array.from(uniqueImages).map((url) => ({ path: url, creator: { connect: { email: "george@noquarter.co" } } })),
            },
            creator: { connect: { email: "george@noquarter.co" } },
          },
        })
      } catch (error) {
        console.log(error)
      }
    }
  }
}

async function main() {
  try {
    // Start at 40, -5 for whole scan of europe
    for (let lat = 40; lat < 75; lat = lat + 7.5) {
      console.log("Lat: " + lat)
      for (let lng = -5; lng < 30; lng = lng + 7.5) {
        console.log("Lng: " + lng)
        await getCards({ lat, lng })
      }
    }
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
