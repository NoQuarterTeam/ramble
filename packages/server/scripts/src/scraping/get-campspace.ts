import * as cheerio from "cheerio"

const url = `https://campspace.com/en/campsites?viewport=-52.03125%2C34.30714385628804%2C80.85937500000001%2C68.49604022839505&location=Map+area&startDate=&endDate=&numberOfAdults=2&numberOfChildren=0&filter%5Baccommodations%5D%5B%5D=bring_motorhome&filter%5Baccommodations%5D%5B%5D=bring_minivan&page=`

const pageCount = 271

import { prisma } from "@ramble/database"
import { convert } from "html-to-text"
import { confirmDeleteSpots } from './helpers/utils'

export type CampspaceSpot = {
  id: number
  latitude: number
  longitude: number
  name: string
  link: string
  images?: string[]
  address?: string
  description?: string
}


async function getPageCards(currentPage: number) {
  const res = await fetch(url + currentPage)
  const html = await res.text()

  const $ = cheerio.load(html)

  const spots: CampspaceSpot[] = []

  $("article.card").each((_, card) => {
    const id = $(card).attr("data-id")
    const latitude = $(card).attr("data-lat")
    const longitude = $(card).attr("data-lng")
    const link = $(card).find(".card-header-a").attr("href")
    const name = $(card).find(".card-header-a").text()

    if (!id || !latitude || !longitude || !link || !name) return
    spots.push({ id: parseInt(id), latitude: parseFloat(latitude), longitude: parseFloat(longitude), name, link })
  })

  console.log(spots.length + " spots found" + " on page " + currentPage)

  const currentData = await prisma.spot.findMany({
    where: { NOT: { campspaceId: null }},
  })

  
  for (let index = 0; index < spots.length; index++) {
    const spot = spots[index]

    const existingSpot = currentData.find((s) => s.campspaceId === spot.id)

    if (existingSpot?.deletedAt) {
      console.log("Spot already deleted: " + spot.link)
      continue
    }

    try {
      const spotDetail = await fetch(spot.link)

      const spotDetailHtml = await spotDetail.text()
      const $ = cheerio.load(spotDetailHtml)

      let images: string[] = []
      $(".space-single-image .space-single-image--img").each((_, img) => {
        const src = $(img).attr("src")
        if (src) images.push(src.replace("teaser", "medium"))
      })

      $(".space-images .space-images--img").each((_, img) => {
        const src = $(img).attr("src")
        if (src) images.push(src.replace("teaser", "medium"))
      })
      images = [...new Set(images)]


      const description = $(".space-section-about .space-p").html()?.trim() || ""

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

      const amenities = { bbq, shower, kitchen, sauna, firePit, wifi, toilet, water, electricity, hotWater, pool }

      if (existingSpot && existingSpot.deletedAt === null) {
        console.log(existingSpot && "Spot exists: " + "https://ramble.guide/spots/"+ existingSpot.id + " updating...")
        await prisma.spot.update({where: {campspaceId: spot.id},  data: {
          name: spot.name,
          address,
          latitude: spot.latitude,
          longitude: spot.longitude,
          description: convert(description, { wordwrap: false, preserveNewlines: true }),
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
          campspaceId: spot.id,
          type: "CAMPING",
          isPetFriendly,
          sourceUrl: spot.link,
          creator: { connect: { email: "jack@noquarter.co" } },
          amenities: {
            upsert: {
              create: amenities,
              update: amenities
            }
          },
        }, include: { images: true}});

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
          console.log("images to delete: " + imagesToDelete.map(image => image.path + " "))
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
        console.log("Adding new spot: " + index + " out of " + spots.length + " / page: " + currentPage + " " + spot.link)
        const newSpot = await prisma.spot.create({
          data: {
            name: spot.name,
            address,
            latitude: spot.latitude,
            longitude: spot.longitude,
            description: convert(description, { wordwrap: false, preserveNewlines: true }),
            images: { create: images.map((image) => ({ path: image, creator: { connect: { email: "jack@noquarter.co" } } })) },
            campspaceId: spot.id,
            type: "CAMPING",
            isPetFriendly,
            sourceUrl: spot.link,
            creator: { connect: { email: "jack@noquarter.co" } },
            amenities: {
              create: { bbq, shower, kitchen, sauna, firePit, wifi, toilet, water, electricity, hotWater, pool },
            },
          },
        })
      
        if (newSpot.coverId === null) {
          const firstImage = await prisma.spotImage.findFirst({where: {spotId: newSpot.id, path: images[0]}, select: {id: true}})
          await prisma.spot.update({
            where: { id: newSpot.id },
            data: {
              cover: { connect: { id: firstImage?.id }},
            },
          });
        }
      }
    } catch (error: any) {
      console.log(spot.id + error)
    }
  }
  return spots.map((s) => s.id)
}

async function main() {
  try {
    let scrapedIds: number[] = []
    // loop over each page
    for (let currentPage = 47; currentPage < pageCount + 1; currentPage++) {
      const spotIds = await getPageCards(currentPage)
      scrapedIds = [...scrapedIds, ...spotIds]

    }
    const dbIds = await prisma.spot.findMany({select: {campspaceId: true, id: true}, where: {deletedAt: null, campspaceId: {not: null}}})
    const spotsToDelete = dbIds.filter(dbId => dbId.campspaceId && !scrapedIds.includes(dbId.campspaceId)).map(dbId => dbId.id) as string[]

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

main().finally(() => process.exit(0))
