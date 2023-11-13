import puppeteer from "puppeteer"
import * as cheerio from "cheerio"
import mossyEarthData from "./data/mossy-earth.json"
import { prisma } from "@ramble/database"
import { geocodeCoords } from "./helpers/geocode"

interface MossyEarthData {
  id: string
  uid: string
  data: {
    title: [{ text: string }]
    subtitle: [{ text: string }]
    header_image: {
      url: string
    }
    project_location: {
      latitude: number
      longitude: number
    }
    summary: [{ text: string }]
  }
}

async function run() {
  const errors: unknown[] = []
  let count = 0
  try {
    // const data = mossyEarthData as MossyEarthData[]
    const siteData = mossyEarthData as typeof mossyEarthData
    const existingMossyEarthSpots = await prisma.spot.findMany({
      where: { mossyEarthId: { in: mossyEarthData.map((data) => data.id) } },
    })
    const existingMossyEarthSpotIds = existingMossyEarthSpots.map((spot) => spot.mossyEarthId)

    for (const spot of siteData) {
      count++
      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      process.stdout.write(`Processing: ${count}/${siteData.length}`)

      const exists = existingMossyEarthSpotIds.includes(spot.id)
      if (exists) continue // skip if already in db

      const url = `https://www.mossy.earth/projects/${spot.uid}`
      const latitude = spot.data.project_location.latitude
      const longitude = spot.data.project_location.longitude

      const address = await geocodeCoords({ latitude: Number(latitude), longitude: Number(longitude) })
      const description = [spot.data.subtitle[0].text, spot.data.summary[0].text].join(". ")

      await prisma.spot.create({
        data: {
          mossyEarthId: spot.id,
          name: spot.data.title[0].text,
          latitude,
          longitude,
          address,
          type: "REWILDING",
          creator: { connect: { email: "dan@noquarter.co" } },
          sourceUrl: url,
          description: spot.data.,
          images: { create: [{ path: spot.data.header_image.url, creator: { connect: { email: "dan@noquarter.co" } } }] },
          isPetFriendly: false,
          amenities: {
            create: {
              bbq: false,
              shower: false,
              kitchen: false,
              sauna: false,
              firePit: false,
              wifi: false,
              toilet: false,
              water: false,
              electricity: false,
              hotWater: false,
              pool: false,
            },
          },
        },
      })
    }
  } catch (e) {
    console.log("---------- ERROR ----------")
    console.log(e)
  }
  if (errors.length > 0) {
    console.log("ERRORS:", errors.length)
    console.log("-------------------------------")
    console.log(errors)
  }
}

async function main() {
  try {
    await run()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main()
  .then(() => {
    console.log("\n")
    console.log("-------------------")
    console.log("Done!")
  })
  .finally(() => process.exit(0))
