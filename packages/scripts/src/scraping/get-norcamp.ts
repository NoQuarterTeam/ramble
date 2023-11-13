import puppeteer from "puppeteer"
import * as cheerio from "cheerio"
import norcampMapData from "./data/norcamp.json"
import { prisma } from "@ramble/database"

interface NorcampMapData {
  cid: string
  nm: string
  x: string
  y: string
}

async function run() {
  const errors: unknown[] = []
  let count = 0
  const acceptedTypes = ["Campsite", "Motorhome Park", "Nature Campsite"]
  const browser = await puppeteer.launch({
    headless: false,
  })
  try {
    const mapData = norcampMapData as NorcampMapData[]
    const existingNorcampSpots = await prisma.spot.findMany({
      where: { norcampId: { in: mapData.map((data) => data.cid) } },
    })
    const existingNorcampSpotIds = existingNorcampSpots.map((spot) => spot.norcampId)

    mapData.reverse() // reversing to get scandi ones first hopefully?

    for (const data of mapData) {
      count++
      process.stdout.clearLine(0)
      process.stdout.cursorTo(0)
      process.stdout.write(`Processing: ${count}/${mapData.length}`)

      const exists = existingNorcampSpotIds.includes(data.cid)
      if (exists) continue // skip if already in db

      const page = await browser.newPage()
      const url = `https://www.norcamp.de/en/camp.${data.cid}.1.html`
      try {
        await page.goto(url)
        await page.waitForNetworkIdle()

        const pageData = await page.evaluate(() => {
          return { html: document.documentElement.innerHTML }
        })

        const $ = cheerio.load(pageData.html)

        const listItems: string[] = []
        $(".list_row").each((_, div) => {
          if ($(div).find(".cg-info-text").length > 0) {
            listItems.push($(div).find(".cg-info-text").text())
          } else {
            listItems.push("")
          }
        })

        const address =
          $("img[title='Address']").parent().siblings().length > 0
            ? $($("img[title='Address']").parent().siblings()[0]).text()
            : ""

        if (!acceptedTypes.includes(listItems[0])) {
          console.log("---------------------- ONION -------------------")
          continue // skip unless accepted spot type
        }
        if ($("img[title='Campervan Pitches']").length === 0) {
          console.log("------------- WEAPON ------------")
          continue // skip if not suitable for campervans
        }

        const images: string[] = []
        $('[id^="slick-slide0"] img').each((_, img) => {
          const src = $(img).attr("src")
          const dataLazy = $(img).attr("data-lazy")
          if (src?.startsWith("http")) images.push(src)
          if (dataLazy?.startsWith("http")) images.push(dataLazy)
        })
        if (images.length < 3) {
          console.log("----------------- JULIAS ------------------")
          console.log(url)
          continue // skip if they don't have at least 3 images
        }

        const isPetFriendly = $("img[title='Dogs Allowed']").length > 0
        const toilet = $("img[title='Toilet']").length > 0
        const shower = $("img[title='Shower']").length > 0
        const electricity = $("img[title='Electricity']").length > 0
        const kitchen = $("img[title='Kitchen']").length > 0
        const wifi = $("img[title='Wifi']").length > 0
        const water = $("img[title='Freshwater']").length > 0

        await prisma.spot.create({
          data: {
            norcampId: data.cid,
            name: data.nm,
            latitude: parseFloat(data.x),
            longitude: parseFloat(data.y),
            address: address,
            type: "CAMPING",
            creator: { connect: { email: "dan@noquarter.co" } },
            sourceUrl: url,
            description: null,
            images: { create: images.map((image) => ({ path: image, creator: { connect: { email: "dan@noquarter.co" } } })) },
            isPetFriendly,
            amenities: {
              create: {
                bbq: false,
                shower,
                kitchen,
                sauna: false,
                firePit: false,
                wifi,
                toilet,
                water,
                electricity,
                hotWater: false,
                pool: false,
              },
            },
          },
        })
      } catch (e) {
        console.log(`error attempting ${data.nm} (${data.cid})`)
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
