import puppeteer from "puppeteer"
import * as cheerio from "cheerio"
import { prisma } from "@ramble/database"

const MAP_SCAN_INCREMENT = 10
// const sw_lat = 23.060344589348873
// const sw_lng = -14.343890427363135
// const ne_lat = 61.871481248538316
// const ne_lng = 38.37358381454612
// lat diff 38.81
// lng diff 52.71
const makeUrl = (swLat: number, swLng: number, neLat: number, neLng: number) =>
  `https://www.hipcamp.com/en-GB/search/2-rv-motorhomes,vehicles?sw_lat=${swLat}&sw_lng=${swLng}&ne_lat=${neLat}&ne_lng=${neLng}`

// START: https://www.hipcamp.com/en-GB/search/2-rv-motorhomes,vehicles?sw_lat=36&sw_lng=-9.5&ne_lat=46&ne_lng=0.5
// https://www.hipcamp.com/en-GB/search/2-rv-motorhomes,vehicles?sw_lat=37.51&sw_lng=-5.01&ne_lat=76.32&ne_lng=47.7

// spain/portugal
// https://www.hipcamp.com/en-GB/search/2-rv-motorhomes,vehicles?sw_lat=32.08703371563267&sw_lng=-13.424422713897627&ne_lat=46.62447981195703&ne_lng=6.236654049821112
// swLat = 32
// swLng = -13.5
// neLat = 46.5
// neLng = 6.5
// https://www.hipcamp.com/en-GB/search/2-rv-motorhomes,vehicles?sw_lat=32&sw_lng=-13.5&ne_lat=46.5&ne_lng=6.5
// https://www.hipcamp.com/en-GB/search/2-rv-motorhomes,vehicles?sw_lat=30&sw_lng=-15.5&ne_lat=44.5&ne_lng=4.5

const between = (n: number, min: number, max: number) => {
  return n >= min && n <= max
}

type MapBoxPlace = {
  features: {
    place_type: string[]
    center: number[]
  }[]
}

export type HipcampSpot = {
  id: string
  name: string
  link: string
  images?: string[]
  description?: string
}

async function getCards({ lat, lng }: { lat: number; lng: number }) {
  const browser = await puppeteer.launch({
    headless: false,
  })

  const swLat = lat
  const swLng = lng
  const neLat = swLat + MAP_SCAN_INCREMENT
  const neLng = swLng + MAP_SCAN_INCREMENT
  const url = makeUrl(swLat, swLng, neLat, neLng)

  const page = await browser.newPage()

  await page.goto(url, { waitUntil: "domcontentloaded" })
  await page.waitForNetworkIdle()

  const pageData = await page.evaluate(() => {
    return { html: document.documentElement.innerHTML }
  })

  const $ = cheerio.load(pageData.html)

  browser.close()

  const spots: HipcampSpot[] = []

  $(".Boexw").each((_, card) => {
    const name = $(card).find(".kCchms").text().trim()
    const link = $(card).find("a").attr("href")
    const id = link?.split("?")[0].split("-").pop()
    if (!id || !link || !name) return
    spots.push({ id, name, link: "https://www.hipcamp.com" + link })
  })

  const paginationText = $($(".hNumns")[0]).text().split(" ")
  const canPaginate = parseInt(paginationText[paginationText.length - 1]) > 40
  if (canPaginate) {
    console.log("---------------- MORE THAN ONE PAGE -----------------")
    console.log(url)
  }

  // TESTING
  // const name = "Camping Merry-sur-Yonne"
  // const link =
  //   "https://www.hipcamp.com/en-GB/land/bourgogne-franche-comte-camping-merry-sur-yonne-r57h7zj9?filters=rv-sites&adults=1&children=0"
  // const id = "r57h7zj9"
  // spots.push({ id, name, link })

  const currentData = await prisma.spot.findMany({
    where: { hipcampId: { in: spots.map((s) => s.id) } },
  })

  for (const spot of spots) {
    try {
      // if in db, continue
      const exists = currentData.find((s) => s.hipcampId === spot.id)
      if (exists) continue

      const browser = await puppeteer.launch({
        headless: false,
      })

      const page = await browser.newPage()

      // // capture background requests:
      // await page.setRequestInterception(true)

      // page.on("request", async (request) => {
      //   if (request.resourceType() === "xhr") {
      //     console.log("--------------- XHR REQUEST ----------------")
      //     // console.log(request.headers())
      //     // console.log(await request.response()?.text())
      //     request.continue()
      //   } else {
      //     // abort all requests other than XHR
      //     request.abort()
      //   }
      // })
      // // capture background responses:
      // page.on("response", async (response) => {
      //   console.log(response.request())
      //   console.log("---------------------------------------------------------------------------------------------------")

      //   // const json = await response.json()
      //   // console.log(JSON.stringify(json))
      //   // const text = await response.text()
      //   // console.log(text)

      //   // @ts-ignore
      //   if (response.resourceType === "xhr") {
      //     console.log("--------------- XHR RESPONSE ----------------")
      //     console.log(response)
      //   }
      // })

      // await page.goto(spot.link)
      // await page.waitForNetworkIdle()

      // await page.close()

      await page.goto(spot.link)
      await page.waitForNetworkIdle()

      const pageData = await page.evaluate(() => {
        return { html: document.documentElement.innerHTML }
      })

      const $ = cheerio.load(pageData.html)

      const address = $(".ModuleWrapper__Module-sc-14a7kbm-0 div .bGWbiH .fKlASc").text().trim()

      if (!address) {
        console.log("NO ADDRESS FOUND:", spot.link)
        continue
      }

      // Castelnau-D'auzan-Labarrèr-Occitanie-France
      // ;("CastelnauD'auzanLabarrère-Occitanie-France")
      // TEST: https://api.mapbox.com/geocoding/v5/mapbox.places/CastelnauD'auzanLabarrère-Occitanie-France.json?access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw

      const modifiedAddress = address
        .split(",")
        .map((e) => e.replaceAll(" ", ""))
        .map((e) => e.replaceAll("-", ""))
        .join("-")
      // geocode to get lat and lng based on address with mapbox
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          modifiedAddress,
        )}.json?bbox=&access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
      )
      const json: MapBoxPlace = await res.json()
      // console.dir(json, { depth: null })

      let coords: number[] = []

      // TODO, make better
      if (json?.features?.length > 0) {
        for (const feature of json.features) {
          if (!feature.place_type.includes("address")) continue
          coords.push(feature.center[1], feature.center[0])
        }
        if (coords.length === 0) {
          for (const feature of json.features) {
            if (!feature.place_type.includes("postcode")) continue
            coords.push(feature.center[1], feature.center[0])
          }
        }
        if (coords.length === 0) {
          coords.push(json.features[0].center[1], json.features[0].center[0])
        }
        if (coords.length === 0) {
          coords.push(0, 0)
        }
      }

      // Check coords fall in expected range TODO cleanup
      if (!between(coords[0], lat, lat + MAP_SCAN_INCREMENT)) {
        console.log("LAT FALLS OUTSIDE OF EXPECTED RANGE")
        console.log("swLat:", swLat)
        console.log("swLng:", swLng)
        console.log("neLat:", neLat)
        console.log("neLng:", neLng)
        console.log("search url:", url)
        console.log("coords:", coords)
        console.log("address:", address)
        console.log("modified address:", modifiedAddress)
        console.log("link:", spot.link)
        console.log("Geocode res:")
        console.dir(json, { depth: null })
        continue
      }
      if (!between(coords[1], lng, lng + MAP_SCAN_INCREMENT)) {
        console.log("LNG FALLS OUTSIDE OF EXPECTED RANGE")
        console.log("swLat:", swLat)
        console.log("swLng:", swLng)
        console.log("neLat:", neLat)
        console.log("neLng:", neLng)
        console.log("search url:", url)
        console.log("coords:", coords)
        console.log("address:", address)
        console.log("modified address:", modifiedAddress)
        console.log("link:", spot.link)
        console.log("Geocode res:")
        console.dir(json, { depth: null })
        continue
      }

      let images: string[] = []
      $(".photos img").each((_, img) => {
        const src = $(img).attr("src")
        if (src) images.push(src)
      })

      const descriptions: string[] = []
      if ($(".Description__TruncatableHTML-sc-1h988p-1 p").length > 0) {
        $(".Description__TruncatableHTML-sc-1h988p-1 p").each((_, p) => {
          const text = $(p).html()?.trim() || ""
          descriptions.push(text)
        })
      } else {
        const text = $(".Description__TruncatableHTML-sc-1h988p-1").html()?.trim() || ""
        descriptions.push(text)
      }

      const description = descriptions.filter((d) => !!d).join(" ")

      const isPetFriendly = $(".eurZOk").filter((_, span) => $(span).text().includes("Pets allowed")).length > 0
      const firePit = $(".eurZOk").filter((_, span) => $(span).text().includes("Campfires allowed")).length > 0
      const water = $(".eurZOk").filter((_, span) => $(span).text().includes("Potable water")).length > 0
      const toilet = $(".eurZOk").filter((_, span) => $(span).text().includes("Toilet")).length > 0
      const electricity = $(".eurZOk").filter((_, span) => $(span).text().includes("Electrical hookup")).length > 0
      // Below amenties not found on hipcamp spot page
      // const bbq = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("BBQ area")).length > 0
      // const kitchen = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Kitchen")).length > 0
      // const shower = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Shower")).length > 0
      // const pool = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Swimming Pool")).length > 0
      // const wifi = $(".product-facility__icons-icon__label").filter((_, p) => $(p).text().includes("Wi-Fi")).length > 0

      await prisma.spot.create({
        data: {
          name: spot.name,
          latitude: coords[0],
          longitude: coords[1],
          description,
          address,
          images: { create: images.map((image) => ({ path: image, creator: { connect: { email: "dan@noquarter.co" } } })) },
          hipcampId: spot.id,
          type: "CAMPING",
          isPetFriendly,
          sourceUrl: spot.link,
          creator: { connect: { email: "dan@noquarter.co" } },
          amenities: {
            create: {
              bbq: false,
              shower: false,
              kitchen: false,
              sauna: false,
              firePit,
              wifi: false,
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
      console.log("ERROR", e)
    }
  }
}

async function main() {
  try {
    // Start at 36, -9.5 for whole scan of europe
    for (let lat = 36; lat < 60; lat = lat + MAP_SCAN_INCREMENT) {
      console.log("Lat: " + lat)
      for (let lng = -9.5; lng < 27; lng = lng + MAP_SCAN_INCREMENT) {
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
