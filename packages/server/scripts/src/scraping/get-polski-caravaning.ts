import puppeteer from "puppeteer"
import * as cheerio from "cheerio"
import { prisma } from "@ramble/database"
import { uniq } from "./helpers/utils"
import { geocodeCoords } from "./helpers/geocode"

async function run() {
  const errors: unknown[] = []
  let count = 0
  const browser = await puppeteer.launch({
    headless: false,
  })
  const page = await browser.newPage()
  const BASE_URL = "https://polskicaravaning.pl"
  const natureSpotUrl = BASE_URL + "/miejscowki?q=t&par=19"

  const existingPolskiSpots = await prisma.spot.findMany({
    where: { polskiCaravaningId: { not: { equals: null } } },
  })
  const existingPolskiSpotIds = existingPolskiSpots.map((spot) => spot.polskiCaravaningId)

  try {
    await page.goto(natureSpotUrl)

    const markers = await page.$x("//img[contains(@class, 'leaflet-marker-icon')]")
    // for (const marker of [markers[0]]) {
    for (const marker of markers) {
      count++
      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      process.stdout.write(`Processing: ${count}/${markers.length}`)

      try {
        // @ts-ignore
        await marker.click()
        await new Promise((r) => setTimeout(r, 200)) // wait a lil bit for popup content to load
        const mapPageData = await page.evaluate(() => ({ html: document.documentElement.innerHTML }))
        const $1 = cheerio.load(mapPageData.html)
        const href = $1(".leaflet-popup-content a").attr("href")
        const name = $1(".leaflet-popup-content h3").text()
        // const img = $(".leaflet-popup-content a").children("img").attr("src")
        // console.log(href)
        // console.log(title)
        // console.log(img)

        if (!href) continue

        const polskiCaravaningId = href.split(",").length > 0 ? href.split(",")[1] : ""
        if (!polskiCaravaningId) continue
        const exists = existingPolskiSpotIds.includes(polskiCaravaningId)
        if (exists) continue // skip if already in db

        const sourceUrl = BASE_URL + href

        await page.goto(sourceUrl)

        const pageData = await page.evaluate(() => ({ html: document.documentElement.innerHTML }))
        const $2 = cheerio.load(pageData.html)

        // console.log($2("h3.forms").length)

        let coords: number[] = []
        let latitude
        let longitude
        // const script = $2(".map-box").find("script").html()
        // if (script) {
        //   const index = script.indexOf("var map = L.map('mapid').setView(")
        //   const matchCharLength = 35
        //   const expectedSubtringLength = 22
        //   coords = script
        //     .substring(index + matchCharLength, index + matchCharLength + expectedSubtringLength)
        //     .split("', '")
        //     .map((coord) => parseFloat(coord))
        // }
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

        // console.log(sourceUrl)
        // console.log(latitude)
        // console.log(longitude)

        const address = await geocodeCoords({ latitude, longitude })
        // console.log(address)

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
            images.push(href)
          }
        })

        await prisma.spot.create({
          data: {
            polskiCaravaningId,
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
        // console.log("error attempting ", node.url)
        errors.push(e)
        continue
      }
    }
    // await page.click(".leaflet-marker-icon")

    // $(".leaflet-marker-icon").each((_,img)=>{
    // 	$(img)
    // })
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
