import puppeteer from "puppeteer"
import * as cheerio from "cheerio"
import { prisma } from "@ramble/database"

async function run() {
  const errors: unknown[] = []
  let count = 0
  const browser = await puppeteer.launch({
    headless: false,
  })
  const page = await browser.newPage()
  const BASE_URL = "https://polskicaravaning.pl"
  const natureSpotUrl = BASE_URL + "/miejscowki?q=t&par=19"
  try {
    await page.goto(natureSpotUrl)

    const markers = await page.$x("//img[contains(@class, 'leaflet-marker-icon')]")
    for (const marker of [markers[0]]) {
      try {
        // @ts-ignore
        await marker.click()
        await new Promise((r) => setTimeout(r, 100)) // wait a lil bit for popup content to load
        const mapPageData = await page.evaluate(() => ({ html: document.documentElement.innerHTML }))
        const $1 = cheerio.load(mapPageData.html)
        const href = $1(".leaflet-popup-content a").attr("href")
        const name = $(".leaflet-popup-content h3").text()
        // const img = $(".leaflet-popup-content a").children("img").attr("src")
        // console.log(href)
        // console.log(title)
        // console.log(img)

        if (!href) continue

        const polskiCaravaningId = href.split(",").length > 0 ? href.split(",")[1] : ""
        if (!polskiCaravaningId) continue

        await page.goto(BASE_URL + href)

        const pageData = await page.evaluate(() => ({ html: document.documentElement.innerHTML }))
        const $2 = cheerio.load(pageData.html)

        // console.log($2("h3.forms").length)

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
