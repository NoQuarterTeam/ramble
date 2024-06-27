import { prisma } from "@ramble/database"
import * as cheerio from "cheerio"
import puppeteer from "puppeteer"
import { uniq } from "../../../../shared/src"
import rewildingEuropeData from "./data/rewilding-europe.json"
import { geocodeCoords } from "./helpers/geocode"

async function run() {
  const errors: unknown[] = []
  let count = 0
  const browser = await puppeteer.launch({
    headless: false,
  })
  const BASE_URL = "https://rewildingeurope.com"
  try {
    const siteData = Object.values(rewildingEuropeData)

    const existingRewildingEuropeSpots = await prisma.spot.findMany({
      where: { rewildingEuropeId: { in: siteData.map((data) => data.id.toString()) } },
    })
    const existingRewildingEuropeSpotIds = existingRewildingEuropeSpots.map((spot) => spot.rewildingEuropeId)

    for (const spot of siteData) {
      count++
      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      process.stdout.write(`Processing: ${count}/${siteData.length}`)

      const exists = existingRewildingEuropeSpotIds.includes(spot.id.toString())
      if (exists) continue // skip if already in db

      const page = await browser.newPage()

      try {
        await page.goto(spot.permalink)
        await page.waitForNetworkIdle()

        const pageData = await page.evaluate(() => {
          return { html: document.documentElement.innerHTML }
        })

        const $ = cheerio.load(pageData.html)

        const images: string[] = []
        $(".contentSlider_image").each((_, div) => {
          const styleAttr = $(div).attr("style")
          if (styleAttr) {
            if (styleAttr.split("'").length > 0) {
              images.push(BASE_URL + styleAttr.split("'")[1])
            }
          }
        })
        // console.log(uniq(images))

        const name = spot.title
        // console.log(name)
        const sourceUrl = spot.permalink
        // console.log(sourceUrl)
        const latitude = parseFloat(spot.latlng.split(",")[0].trim())
        // console.log(latitude)
        const longitude = parseFloat(spot.latlng.split(",")[1].trim())
        // console.log(longitude)
        const address = (await geocodeCoords({ latitude: Number(latitude), longitude: Number(longitude) })) || spot.country
        // console.log(address)

        const abstractMarkup = cheerio.load(spot.abstract, null, false)
        const description = abstractMarkup("*").text()
        // console.log(description)

        await prisma.spot.create({
          data: {
            rewildingEuropeId: spot.id.toString(),
            name,
            latitude,
            longitude,
            address,
            type: "REWILDING",
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
        console.log()
        console.log(`error attempting ${spot.title || "no name"} (${spot.id})`)
        errors.push(e)
        continue
      } finally {
        page.close()
      }
    }
  } catch (e) {
    console.log("---------- ERROR ----------")
    console.log(e)
  } finally {
    browser.close()
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
