import * as cheerio from "cheerio"

const url = `https://www.loodusegakoos.ee/where-to-go/search-options?element_holder%5Bobject_type%5D%5B%5D=Campsite&search=1&search_type=Puhkeala&element%5Btitle%5D=#tulemus`

import { prisma } from "@ramble/database"
import { confirmDeleteSpots } from './helpers/utils'
import { convert } from 'html-to-text'
import { geocodeCoords } from '@ramble/server-services'



export type Spot = {
  id: string
  latitude: number
  longitude: number
  name: string
  link: string
  images?: string[]
  address?: string
  description?: string
}

async function getCards() {
  const res = await fetch(url)
  const html = await res.text()
  const $ = cheerio.load(html)

  const spots = $(".result-row")
  let spotIds: string[] = []

  for (let index = 0; index < spots.length; index++) {
    const spot = $(spots[index])
    const link = "https://www.loodusegakoos.ee" + spot.find("a").attr("href")

    try {
      const detailPage = await fetch(link)
      const spotDetailHtml = await detailPage.text()

      const $ = cheerio.load(spotDetailHtml)

      const isCampsite = $("table td").text().includes("Campsite")
      const suitableForVans = $("tr td").text().includes("Parking for")

      if (!isCampsite || !suitableForVans) continue

      const id = link.split("/")?.[link.split("/").length - 1]

      const currentData = await prisma.spot.findMany({
        select: { loodusegakoosId: true, deletedAt: true, id: true, coverId: true},
        where: { type: "CAMPING", loodusegakoosId: { in: spots.toArray().map((s) => id) } },
      })

      const existingSpot = currentData.find((s) => s.loodusegakoosId === id)

      if (existingSpot?.deletedAt) {
        console.log("Spot already deleted: " + link)
        continue
      }

      const name = spot.find(".location-name a").text().trim()
      const description = spot.find(".location-sightseeing").text().trim()
      const firePit = spot.find(".ico-fireplace").length > 0

      const coords = $("table td").text().split("latitude")[1]
      const latitude = coords && parseFloat(coords.split("longitude")[0].split(" ")[1])
      const longitude = coords && parseFloat(coords.split("longitude")[1].split(" ")[1])

      if (!latitude || !longitude) return
      const location = await geocodeCoords({ latitude: Number(latitude), longitude: Number(longitude) })
      const toilet = $("tr td").text().includes("toilet")

      let images: string[] = []

      $(".edys-gallery")
        .find("a")
        .map((_, image) => {
          const src = "https:" + image.attribs.href
          if (src) images.push(src)
        })

      const uniqueImages = [...new Set(images)]

      const amenities = {
          shower: false,
          kitchen: false,
          toilet: toilet,
          water: false,
          electricity: false,
          hotWater: false,
          firePit,
          wifi: false,
          bbq: false,
          sauna: false,
          pool: false,
      }

      if (existingSpot && existingSpot.deletedAt === null) {
        console.log(existingSpot && "Spot exists: " + "https://ramble.guide/spots/"+ existingSpot.id + " updating...")

        await prisma.spot.update({where: {loodusegakoosId: id},  data: {
          name: name,
          latitude: latitude,
          longitude: longitude,
          address: location.address || location.place,
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
                  creator: { connect: { email: "george@noquarter.co" } },
                };
              }
      
              // If the image already exists, return an empty object to skip its creation
              return {};
            }))).filter(image => Object.keys(image).length !== 0) as { path: string; creator: { connect: { email: string } } }[], // Filter out null values (indicating duplicates)
          },
          loodusegakoosId: id,
          type: "CAMPING",
          isPetFriendly: true,
          sourceUrl: link,
          creator: { connect: { email: "george@noquarter.co" } },
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
        console.log("Adding spot: " + index + " out of " + spots.length)
  
        const newSpot = await prisma.spot.create({
          data: {
            loodusegakoosId: id,
            name: name,
            latitude: latitude,
            longitude: longitude,
            address: location.address || location.place,
            description: convert(description, { wordwrap: false, preserveNewlines: true }),
            type: "CAMPING",
            sourceUrl: link,
            isPetFriendly: true,
            creator: { connect: { email: "george@noquarter.co" } },
            images: {
              create: uniqueImages.map((image) => ({ path: image, creator: { connect: { email: "george@noquarter.co" } } })),
            },
            amenities: {
              create: amenities
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
      spotIds.push(id)
    } catch (error) {
      console.log(error)
    }
  }
  return spotIds
}

async function main() {
  try {
    const scrapedIds = await getCards()
    if (!scrapedIds) throw new Error("No scraped ids")

    const dbIds = await prisma.spot.findMany({select: {loodusegakoosId: true, id: true}, where: {deletedAt: null, loodusegakoosId: {not: null}}})
    const spotsToDelete = dbIds.filter(dbId => dbId.loodusegakoosId && !scrapedIds.includes(dbId.loodusegakoosId)).map(dbId => dbId.id) as string[]

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
