import * as cheerio from "cheerio"

const url = `https://terreinzoeker.natuurkampeerterreinen.nl/?terrain&open_at&property_id%5B0%5D=103&property_id%5B1%5D=5&action=terrain_results_loop&maptype=mapbox`

import { prisma } from "@ramble/database"
import { convert } from 'html-to-text'
import { confirmDeleteSpots } from './helpers/utils'

export type NatuurSpot = {
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
  let spotIds: string[] = []
  const res = await fetch(url)
  const html = await res.text()
  const $ = cheerio.load(html)

  const spots = $(".terrain")

  const currentData = await prisma.spot.findMany({
    select: { natuurKampeerterreinenId: true, deletedAt: true, id: true, coverId: true},
    where: { type: "CAMPING", natuurKampeerterreinenId: { not: null } },
  })

  console.log(spots.length + " spots found")


  for (let index = 0; index < spots.length; index++) {
    const spot = spots[index]
    const id = spot.attribs["data-item"]
    spotIds.push(id)
    const existingSpot = currentData.find((s) => s.natuurKampeerterreinenId === id)

    if (existingSpot?.deletedAt) {
      console.log("Spot already deleted: " + spot.attribs.href)
      continue
    }

    try {
      const link = spot.attribs.href
      const detailPage = await fetch(link)
      const spotDetailHtml = await detailPage.text()
      const $ = cheerio.load(spotDetailHtml)
      const name = $(".c-terrain__title").text().trim()
      const description = $(".c-terrain__content").find("p").first().text().trim()
      const address = $("#contact").next().find("span").html()?.replaceAll("<br>", ", ").trim()
      const coords = $(".c-terrain__list").find("li").last().text().trim()
      const latitude = parseFloat(coords.split(" ")[1])
      const longitude = parseFloat(coords.split(" ")[2])
      const isPetFriendly = $(".c-terrain__list").find(".icon-pets-welcome").length > 0

      const kitchen = $(".c-terrain__list").find(".icon-pets-welcome").length > 0
      const electricity = $(".c-terrain__list").find(".icon-electricity-per-day").length > 0
      const hotWater = true
      const water = true
      const shower = true
      const toilet = true
      const wifi = $(".c-terrain__list").find(".icon-wifi-available").length > 0
      const firePit = $(".c-terrain__list").find(".icon-campfire-allowed").length > 0
      const bbq = false
      const sauna = false
      const pool = false

      const amenities = { bbq, shower, kitchen, sauna, firePit, wifi, toilet, water, electricity, hotWater, pool }


      let images: string[] = []
      $(".c-terrain__media")
        .find("img")
        .map((_, image) => {
          const src = image.attribs.src
          if (src) images.push(src)
        })

      if (existingSpot && existingSpot.deletedAt === null) {
        console.log(existingSpot && "Spot exists: " + "https://ramble.guide/spots/"+ existingSpot.id + " updating...")
        await prisma.spot.update({where: {natuurKampeerterreinenId: id},  data: {
          name: spot.name,
          address,
          latitude,
          longitude,
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
          natuurKampeerterreinenId: id,
          type: "CAMPING",
          isPetFriendly,
          sourceUrl: link,
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
        console.log("Adding new spot: " + index + " out of " + spots.length + " " + link)
        const newSpot = await prisma.spot.create({
          data: {
            natuurKampeerterreinenId: id,
            name: name,
            address,
            latitude: latitude,
            longitude: longitude,
            description,
            type: "CAMPING",
            sourceUrl: link,
            isPetFriendly,
            creator: { connect: { email: "jack@noquarter.co" } },
            images: { create: images.map((image) => ({ path: image, creator: { connect: { email: "jack@noquarter.co" } } })) },
            amenities: {
              create: amenities,
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
    } catch (error) {
      console.log(error)
    }
  }
  return spotIds
}

async function main() {
  try {
    const spotIds = await getCards()
    const dbIds = await prisma.spot.findMany({select: {natuurKampeerterreinenId: true, id: true}, where: {deletedAt: null, natuurKampeerterreinenId: {not: null}}})
    const spotsToDelete = dbIds.filter(dbId => dbId.natuurKampeerterreinenId && spotIds && !spotIds.includes(dbId.natuurKampeerterreinenId)).map(dbId => dbId.id) as string[]

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
