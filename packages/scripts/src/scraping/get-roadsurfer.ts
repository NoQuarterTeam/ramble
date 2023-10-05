import puppeteer from "puppeteer"
import * as cheerio from "cheerio"

const url = `https://spots.roadsurfer.com/en-gb/roadsurfer-spots?allowWithoutLocation&categoryIds&country&endDate&locationSearchString=Selected%20area&maxPrice&onlyFreeSpots&searchRadius=565&searchType=modified&sort=distance&startDate&terrainFor[]=camperVan`

import exampleData from "./komoot.json"

import { prisma } from "@ramble/database"
import { SpotType } from "@ramble/database/types"
import { convert } from "html-to-text"

export type RoadsurferSpot = {
  id: string
  latitude?: number
  longitude?: number
  name: string
  link: string
  images?: string[]
  address?: string
  description?: string
}

async function getCards({ lat, lng }: { lat: number; lng: number }) {
  const urlWithParams = url + "&lat=" + lat + "&lng=" + lng
  const browser = await puppeteer.launch({
    headless: "new",
  })

  const page = await browser.newPage()

  await page.goto(urlWithParams)
  await page.waitForNetworkIdle()

  const pageData = await page.evaluate(() => {
    return { html: document.documentElement.innerHTML }
  })

  const $ = cheerio.load(pageData.html)

  browser.close()

  const newSpots: RoadsurferSpot[] = []

  // +11 on mozilla classname

  $(".jss127").each((_, card) => {
    const id = $(card).attr("id")?.split("-")[3]
    const name = $(card).find(".jss135").text().trim()
    const link = $(card).find("a").attr("href")

    if (!id || !link || !name) return
    newSpots.push({ id, name, link })
  })

  const currentData = await prisma.spot.findMany({
    where: { roadsurferId: { in: newSpots.map((s) => s.id) } },
  })

  for (let index = 0; index < newSpots.length; index++) {
    const spot = newSpots[index]

    try {
      // if in db, continue
      const exists = currentData.find((s) => s.roadsurferId === spot.id)
      console.log(exists && "Spot exists: " + spot.id)
      if (exists) continue

      console.log("Adding spot: " + index + " out of " + newSpots.length + " - " + lat + "," + lng)

      const browser = await puppeteer.launch({
        headless: "new",
      })

      const page = await browser.newPage()

      await page.goto(spot.link)
      await page.waitForNetworkIdle()

      const pageData = await page.evaluate(() => {
        return { html: document.documentElement.innerHTML }
      })
      browser.close()

      const $ = cheerio.load(pageData.html)

      const latitude = $("#productMap").attr("data-latitude")
      const longitude = $("#productMap").attr("data-longitude")

      if (!latitude || !longitude) return

      let images: string[] = []
      $(".product-images__slider-big picture img").each((_, img) => {
        const src = $(img).attr("src")
        if (src) images.push("https://spots.roadsurfer.com" + src)
      })

      const description = $(".product-info__description").html()?.trim() || ""

      const isPetFriendly =
        $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Pets allowed")).length > 0

      const bbq = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("BBQ area")).length > 0
      const kitchen = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Kitchen")).length > 0
      const electricity =
        $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Electricity")).length > 0

      const water = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Drinking Water")).length > 0
      const shower = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Shower")).length > 0
      const toilet = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Toilet")).length > 0
      const pool = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Swimming Pool")).length > 0
      const wifi = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Wi-Fi")).length > 0
      const firePit = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Campfire")).length > 0

      await prisma.spot.create({
        data: {
          name: spot.name,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          description: convert(description, { wordwrap: false, preserveNewlines: true }),
          images: { create: images.map((image) => ({ path: image, creator: { connect: { email: "george@noquarter.co" } } })) },
          roadsurferId: spot.id,
          type: "CAMPING",
          isPetFriendly,
          sourceUrl: spot.link,
          creator: { connect: { email: "george@noquarter.co" } },
          // verifier: { connect: { email: "george@noquarter.co" } },
          amenities: {
            create: { bbq, shower, kitchen, sauna: false, firePit, wifi, toilet, water, electricity, hotWater: false, pool },
          },
        },
      })
    } catch {}
  }
}

async function main() {
  try {
    // Start at 40, -5 for whole scan of europe
    for (let lat = 47.5; lat < 75; lat = lat + 7.5) {
      console.log("Lat: " + lat)
      for (let lng = 17.5; lng < 30; lng = lng + 7.5) {
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
