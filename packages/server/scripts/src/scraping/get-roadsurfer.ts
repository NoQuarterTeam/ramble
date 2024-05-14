import puppeteer from "puppeteer"
import * as cheerio from "cheerio"

const makeUrl = (lat: string, lng: string) =>
  `https://spots.roadsurfer.com/en-gb/roadsurfer-spots?allowWithoutLocation&categoryIds&country&endDate&lat=${lat}&lng=${lng}&locationSearchString=Selected%20area&maxPrice&onlyFreeSpots&searchRadius=250&searchType=modified&sort=distance&startDate&terrainFor[]=camperVan`


import { prisma } from "@ramble/database"

import { convert } from "html-to-text"
import { confirmDeleteSpots } from './helpers/utils'

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
  console.log(lat,lng)
  const urlWithParams = makeUrl(lat, lng)
  const browser = await puppeteer.launch({
    headless: true,
  })

  const page = await browser.newPage()
  
  
  await page.goto(urlWithParams, {
    waitUntil: 'networkidle0', // Waits until network is idle (no more than 2 connections for at least 500 ms)
  });
 

  // Take a screenshot
  await page.screenshot({path: 'debug_screenshot.png'});

  // Dump the HTML to a file to inspect
  await page.evaluate(() => document.documentElement.outerHTML).then(html => {
      require('fs').writeFileSync('debug_html.html', html);
  });

  const pageData = await page.evaluate(() => {
    return { html: document.documentElement.innerHTML }
  })

  const elements = await page.$$eval('div[id*="spot-result-item-"]', divs => divs.length);
  console.log('Number of divs found:', elements); // This should print the count of elements

  const $ = cheerio.load(pageData.html)
  
  const spots: RoadsurferSpot[] = []
  const spotsCount = $('div[id*="spot-result-item-"]').length

  // // Select elements and log their HTML
  // $('div[id*="spot-result-item-"]').each(function() {
  //   console.log($(this).html());
  // });

  console.log(spotsCount + " spots found" + " for coords " + lat + "," + lng + " " + urlWithParams)

  $('div[id*="spot-result-item-"]').each((_, card) => {
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
    spots.push({ id, name, link })
  })

  const currentData = await prisma.spot.findMany({
    where: { roadsurferId: { in: spots.map((s) => s.id) } },
  })

  for (let index = 0; index < spots.length; index++) {
    const spot = spots[index]

    const existingSpot = currentData.find((s) => s.roadsurferId === spot.id)

    if (existingSpot?.deletedAt) {
      console.log("Spot already deleted: " + spot.link)
      continue
    }

    try {
      console.log("Getting spot data: " + index + " out of " + spots.length + " - " + lat + "," + lng)

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

      const amenities = { bbq, shower, kitchen, sauna: false, firePit, wifi, toilet, water, electricity, hotWater: false, pool }


      // if in db, continue
      const existingSpot = currentData.find((s) => s.roadsurferId === spot.id)
      if (existingSpot && existingSpot.deletedAt === null) {
        console.log(existingSpot && "Spot exists: " + "https://ramble.guide/spots/"+ existingSpot.id + " updating...")
        await prisma.spot.update({
          where: { roadsurferId: spot.id },
          data: {
            roadsurferId: spot.id,
            name: spot.name,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            description: convert(description, { wordwrap: false, preserveNewlines: true }),
            type: "CAMPING",
            isPetFriendly,
            sourceUrl: spot.link,
            creator: { connect: { email: "george@noquarter.co" } },
            amenities: {
              upsert: {
                create: amenities,
                update: amenities
              }
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
                    creator: { connect: { email: "george@noquarter.co" } },
                  };
                }
        
                // If the image already exists, return an empty object to skip its creation
                return {};
              }))).filter(image => Object.keys(image).length !== 0) as { path: string; creator: { connect: { email: string } } }[], // Filter out null values (indicating duplicates)
            },
          },
        })

        if (existingSpot.coverId === null) {
          // Find the corresponding image of the first image in the images array
          const firstImage = await prisma.spotImage.findFirst({where: {spotId: existingSpot.id, path: images[0]}, select: {id: true}})

          if (firstImage) {
            await prisma.spot.update({
              where: { id: existingSpot.id },
              data: {
                cover: { connect: { id: firstImage?.id }}
              },
            });
          }
        }

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
        console.log("Adding new spot: " + index + " out of " + spots.length + " - " + lat + "," + lng)

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
              create: amenities
            }
          },
        })
      }

      await browser.close();

    } catch (error) {
      console.log(spot.id + error)
    }
  }
  return spots.map((s) => s.id)
}

async function main() {
  try {
    let scrapedIds: string[] = []
    
    // Start at 36 lat, -10 lng for whole scan of europe
    for (let lat = 36; lat < 75; lat = lat + 1) {
      console.log("Lat: " + lat)
      for (let lng = -10; lng < 32; lng = lng + 1) {
        console.log("Lng: " + lng)
        const spotIds = await getCards({
          lat: Number(Math.round(parseFloat(lat + "e" + 2)) + "e-" + 2).toFixed(2),
          lng: Number(Math.round(parseFloat(lng + "e" + 2)) + "e-" + 2).toFixed(2),
        })
        scrapedIds = [...scrapedIds, ...spotIds]
      }
    }

    const dbIds = await prisma.spot.findMany({select: {roadsurferId: true, id: true}, where: {deletedAt: null, roadsurferId: {not: null}}})
    const spotsToDelete = dbIds.filter(dbId => dbId.roadsurferId && !scrapedIds.includes(dbId.roadsurferId)).map(dbId => dbId.id) as string[]


    if (spotsToDelete.length > 0) {
      await confirmDeleteSpots(spotsToDelete)
    } else {
      console.log("No spots to delete");
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
