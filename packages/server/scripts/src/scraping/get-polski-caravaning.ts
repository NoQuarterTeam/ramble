import { prisma } from "@ramble/database"
import * as cheerio from "cheerio"
import puppeteer from "puppeteer"
import { uniq } from "../../../../shared/src"
import { POLSKI_SPOT_IDS } from "./data/polski-caravaning"
import { geocodeCoords } from "./helpers/geocode"

async function run() {
  const errors: unknown[] = []
  let count = 0
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  const BASE_URL = "https://polskicaravaning.pl"

  const existingPolskiSpots = await prisma.spot.findMany({
    where: { polskiCaravaningId: { not: { equals: null } } },
  })
  const existingPolskiSpotIds = existingPolskiSpots.map((spot) => spot.polskiCaravaningId)

  for (const id of POLSKI_SPOT_IDS) {
    count++
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
    process.stdout.write(`Processing: ${count}/${POLSKI_SPOT_IDS.length}`)

    try {
      const exists = existingPolskiSpotIds.includes(id.toString())
      if (exists) continue // skip if already in db

      const mapMarkerContentUrl = BASE_URL + `/mapa/marker/katalog/${id}`
      await page.goto(mapMarkerContentUrl)
      const pageData1 = await page.evaluate(() => ({ html: document.documentElement.innerHTML }))
      const $1 = cheerio.load(pageData1.html)

      const rawHref = $1("a").attr("href")
      if (!rawHref) continue
      const href = rawHref.replaceAll("\\", "").replaceAll('"', "")

      const sourceUrl = BASE_URL + href

      await page.goto(sourceUrl)
      const pageData = await page.evaluate(() => ({ html: document.documentElement.innerHTML }))
      const $2 = cheerio.load(pageData.html)

      const name = $2("h2.title").text()

      let coords: number[] = []
      let latitude
      let longitude
      const buttonHref = $2("a[data-btn='geo']").attr("href")
      if (!buttonHref) continue
      const popped = buttonHref.split("/").pop()
      if (!popped) continue
      coords = popped.split(",").map((coord) => parseFloat(coord))

      if (coords.length === 2) {
        latitude = coords[0]
        longitude = coords[1]
      }
      if (!latitude || !longitude) {
        errors.push("no coords found for:", sourceUrl)
        continue
      }

      const address = await geocodeCoords({ latitude, longitude })

      const paragraphs: string[] = []
      $2("h3.forms")
        .siblings(".txt")
        .children()
        .each((_, p) => {
          const text = $2(p).text()
          if (text) {
            paragraphs.push(text)
          }
        })

      const description = paragraphs
        .map((desc) => {
          let onion = desc.trim()
          if (onion.endsWith(".")) {
            onion = onion.slice(0, -1)
          }
          return onion
        })
        .join(". ")

      const images: string[] = []
      $2(".sw-gallery figure a").each((_, a) => {
        const href = $2(a).attr("href")
        if (href) {
          if (href.startsWith("http")) {
            images.push(href)
          } else {
            images.push(BASE_URL + "/" + href)
          }
        }
      })

      await prisma.spot.create({
        data: {
          polskiCaravaningId: id.toString(),
          name,
          latitude,
          longitude,
          address,
          type: "CAMPING",
          creator: { connect: { email: "dan@noquarter.co" } },
          sourceUrl,
          description,
          images: {
            create: uniq(images).map((image) => ({ path: image, creator: { connect: { email: "dan@noquarter.co" } } })),
          },
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
    } catch (e) {
      errors.push(e)
      continue
    }
  }
  if (errors.length > 0) {
    console.log()
    console.log("-------------------------------")
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
