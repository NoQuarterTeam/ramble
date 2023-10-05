import puppeteer from "puppeteer"
import * as cheerio from "cheerio"

const url = `https://spots.roadsurfer.com/en-gb/roadsurfer-spots?allowWithoutLocation&categoryIds&country&endDate&locationSearchString=Selected%20area&maxPrice&onlyFreeSpots&searchRadius=565&searchType=modified&sort=distance&startDate&terrainFor[]=camperVan`

import exampleData from "./komoot.json"

import { prisma } from "@ramble/database"
import { SpotType } from "@ramble/database/types"

async function getCards({ lat, lng }: { lat: number; lng: number }) {
  const urlWithParams = url + "&lat=" + lat + "&lng=" + lng

  // Open the installed Chromium. We use headless: false
  // to be able to inspect the browser window.
  const browser = await puppeteer.launch({
    headless: false,
  })

  // Open a new page / tab in the browser.
  const page = await browser.newPage()

  // Tell the tab to navigate to the JavaScript topic page.
  await page.goto(urlWithParams)
  await page.waitForNetworkIdle()

  const pageData = await page.evaluate(() => {
    return { html: document.documentElement.innerHTML }
  })

  const $ = cheerio.load(pageData.html)

  let spots

  // +11 on mozilla classname

  $(".jss127").each((_, card) => {
    const id = $(card).attr("id")?.split("-")[3]
    const name = $(card).find(".jss135").text().trim()
    const link = $(card).find("a").attr("href")

    if (!id || !link || !name) return

    spots.push({ id: parseInt(id), name, link })
  })

  const currentData = await prisma.spot.findMany({
    where: { roadsurferId: { in: spots.map((s) => s.id) } },
  })

  for (let index = 0; index < spots.length; index++) {
    const spot = spots[index]

    try {
      // if in db, continue
      const exists = currentData.find((s) => s.roadsurferId === spot.id)
      if (exists) continue

      const spotDetail = await fetch(spot.link)

      const spotDetailHtml = await spotDetail.text()
      const $ = cheerio.load(spotDetailHtml)

      let images: string[] = []
      $(".space-images .space-images--img").each((_, img) => {
        const src = $(img).attr("src")
        if (src) images.push(src.replace("teaser", "medium"))
      })
      const description = $(".about-popup .popup-body").html()?.trim() || ""

      const address =
        $(".space-header--part-location")
          .text()
          .replace(/(\r\n|\n|\r)/gm, "")
          .replace(/ /g, "")
          .trim()
          .split(",")
          .join(", ") || ""

      const isPetFriendly = $("p").filter((_, p) => $(p).text().includes("Pets allowed")).length > 0

      const bbq = $("p").filter((_, p) => $(p).text().includes("BBQ")).length > 0
      const kitchen = $("p").filter((_, p) => $(p).text().includes("Kitchen")).length > 0
      const electricity = $("p").filter((_, p) => $(p).text().includes("Electricity")).length > 0
      const hotWater = $("p").filter((_, p) => $(p).text().includes("Hot water")).length > 0
      const water = $("p").filter((_, p) => $(p).text().includes("Water")).length > 0
      const shower = $("p").filter((_, p) => $(p).text().includes("shower")).length > 0
      const toilet = $("p").filter((_, p) => $(p).text().includes("Toilet")).length > 0
      const pool = $("p").filter((_, p) => $(p).text().includes("Pool")).length > 0
      const wifi = $("p").filter((_, p) => $(p).text().includes("WiFi")).length > 0
      const firePit = $("p").filter((_, p) => $(p).text().includes("Fire")).length > 0
      const sauna = $("p").filter((_, p) => $(p).text().includes("Sauna")).length > 0

      await prisma.spot.create({
        data: {
          name: spot.name,
          address,
          latitude: spot.latitude,
          longitude: spot.longitude,
          description,
          images: { create: images.map((image) => ({ path: image, creator: { connect: { email: "jack@noquarter.co" } } })) },
          roadsurferId: spot.id,
          type: "CAMPING",
          isPetFriendly,
          roadsurferUrl: spot.link,
          creator: { connect: { email: "jack@noquarter.co" } },
          verifier: { connect: { email: "jack@noquarter.co" } },
          amenities: {
            create: { bbq, shower, kitchen, sauna, firePit, wifi, toilet, water, electricity, hotWater, pool },
          },
        },
      })
    } catch {}
  }
}

async function main() {
  try {
    // Start at 40, -5 for whole scan of europe
    // for (let lat = 40; lat < 75; lat = lat + 7.5) {
    //   console.log("Lat: " + lat)
    //   for (let lng = -5; lng < 30; lng = lng + 7.5) {
    //     console.log("Lng: " + lng)
    await getCards({ lat: 40, lng: -5 })
    //   }
    // }
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
