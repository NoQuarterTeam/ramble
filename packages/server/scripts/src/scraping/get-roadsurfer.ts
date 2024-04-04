import puppeteer from "puppeteer"
import * as cheerio from "cheerio"

const makeUrl = (lat: string, lng: string) =>
  `https://spots.roadsurfer.com/en-gb/roadsurfer-spots?allowWithoutLocation&categoryIds&country&endDate&lat=${lat}&lng=${lng}&locationSearchString=Selected%20area&maxPrice&onlyFreeSpots&searchRadius=250&searchType=modified&sort=distance&startDate&terrainFor[]=camperVan`


import { prisma } from "@ramble/database"

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

async function getCards({ lat, lng }: { lat: string; lng: string }) {
  console.log(lat, lng)
  const urlWithParams = makeUrl(lat, lng)
  console.log(urlWithParams)
  const browser = await puppeteer.launch({
    headless: true,
  })

  const page = await browser.newPage()

  
  await page.goto(urlWithParams, {
    waitUntil: "domcontentloaded",
  })
  
  await new Promise((r) => setTimeout(r, 5000))
  
  const pageData = await page.evaluate(() => {
    return { html: document.documentElement.innerHTML }
  })

  console.log("Got page data:" + pageData.html)

  const $ = cheerio.load(pageData.html)

  const newSpots: RoadsurferSpot[] = []
  const newSpotCount = $('div[id^="spot-result-item-"]').length

  console.log(newSpotCount + " spots found")

  // +11 on mozilla classname
  $('div[id^="spot-result-item-"]').each((_, card) => {
    // $(".jss127").each((_, card) => {
    const id = $(card).attr("id")?.split("-")[3]
    const name = $(card).find("a").eq(1).next().text().trim()
    const link = $(card).find("a").attr("href")

    if (!id) {
      console.log("No id found")
      return
    }
    if (!name) {
      console.log("No name found")
      return
    }
    if (!link) {
      console.log("No link found")
      return
    }
    newSpots.push({ id, name, link })
  })

  const currentData = await prisma.spot.findMany({
    where: { roadsurferId: { in: newSpots.map((s) => s.id) } },
  })

  for (let index = 0; index < newSpots.length; index++) {
    const spot = newSpots[index]

    try {
      console.log("Getting spot data: " + index + " out of " + newSpots.length + " - " + lat + "," + lng)

      const browser = await puppeteer.launch({
        headless: true,
      })

      const detailPage = await browser.newPage()

      await detailPage.goto(spot.link, {
        waitUntil: "domcontentloaded",
      })
      await detailPage.waitForNetworkIdle({ idleTime: 250 })

      const pageData = await detailPage.evaluate(() => {
        return { html: document.documentElement.innerHTML }
      })
      browser.close()

      const $ = cheerio.load(pageData.html)

      const latitude = $("#productMap").attr("data-latitude")
      const longitude = $("#productMap").attr("data-longitude")

      if (!latitude || !longitude) {
        console.log("no lat or lng")
        continue
      }

      let images: string[] = []
      $(".product-images__slider-big picture img").each((_, img) => {
        const src = $(img).attr("src")
        if (src) images.push("https://spots.roadsurfer.com" + src)
      })

      images = [...new Set(images)]

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


      // if in db, continue
      const existingSpot = currentData.find((s) => s.roadsurferId === spot.id)
      console.log(existingSpot && "Spot exists: " + spot.id + " updating...")
      if (existingSpot) {
        await prisma.spot.update({
          where: { roadsurferId: spot.id },
          data: {
            roadsurferId: spot.id,
            hipcampId: null,
            name: spot.name,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            description: convert(description, { wordwrap: false, preserveNewlines: true }),
            type: "CAMPING",
            isPetFriendly,
            sourceUrl: spot.link,
            creator: { connect: { email: "george@noquarter.co" } },
            amenities: {
              update: { bbq, shower, kitchen, sauna: false, firePit, wifi, toilet, water, electricity, hotWater: false, pool },
            },
            images: {
              create: (await Promise.all(images.map(async (imagePath) => {
                // Check if the image already exists for the spot
                const existingImage = await prisma.spotImage.findFirst({
                  where: {
                    path: imagePath,
                    spotId: existingSpot.id,
                  },
                });
        
                // If the image doesn't exist, create it
                if (!existingImage) {
                  return {
                    path: imagePath,
                    creator: { connect: { email: "jack@noquarter.co" } },
                  };
                }
        
                // If the image already exists, return an empty object to skip its creation
                return {};
              }))).filter(image => Object.keys(image).length !== 0) as { path: string; creator: { connect: { email: string } } }[], // Filter out null values (indicating duplicates)
            },
          },
        })
         // Fetch existing images associated with the spot
        const existingImages = await prisma.spotImage.findMany({
          where: { spotId: existingSpot.id }, 
          include: { spot: true },
        });

        // Find images to delete (images that are not in the images array)
        const imagesToDelete = existingImages.filter(image => !images.includes(image.path));

        if (imagesToDelete.length > 0) {
          console.log("images to delete: " + imagesToDelete.map(image => image.path))
        }

        // Delete images
        await Promise.all(imagesToDelete.map(async (image) => {
          // check if image is cover image
          if (image.spot.coverId === image.id) {
            await prisma.spot.update({
              where: { id: image.spot.id },
              data: {
                coverId: null,
              },
            });
          }
          await prisma.spotImage.delete({
            where: { id: image.id },
          });
        }));
      } else {
        console.log("Adding spot: " + index + " out of " + newSpots.length + " - " + lat + "," + lng)

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
            amenities: {
              create: { bbq, shower, kitchen, sauna: false, firePit, wifi, toilet, water, electricity, hotWater: false, pool },
            },
          },
        })
      }

      await browser.close();

    } catch (error) {
      console.log(spot.id + error)
    }
  }
}

async function main() {
  try {
    // Start at 36, -10 for whole scan of europe
    for (let lat = 36; lat < 71; lat = lat + 1) {
      console.log("Lat: " + lat)
      for (let lng = -10; lng < 32; lng = lng + 1) {
        console.log("Lng: " + lng)
        await getCards({
          lat: Number(Math.round(parseFloat(lat + "e" + 2)) + "e-" + 2).toFixed(2),
          lng: Number(Math.round(parseFloat(lng + "e" + 2)) + "e-" + 2).toFixed(2),
        })
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
