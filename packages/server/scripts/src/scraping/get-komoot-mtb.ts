import * as cheerio from "cheerio"

// mtb
const url = `https://www.komoot.com/api/v007/discover_tours/?srid=4326&format=simple&fields=timeline&timeline_highlights_fields=images,start_point&limit=100&max_distance=500000&sport=mtb&surface=prefer_unpaved&hl=en&usersetting.creator.username=3437280258324`


import { prisma } from "@ramble/database"
import { SpotType } from "@ramble/database/types"
import { checkImageStatus, confirmDeleteSpots } from './helpers/utils';

const headers = {
  "Cookie": "kmt_rid=a65679a8958b1d5f6da6973bd3e2fa7a8838acc29549dbf335; _ga_R7DCLCR1RB=GS1.1.1713883884.7.1.1713884733.60.0.0; _ga=GA1.1.1830738674.1711541531; kmt_sess=eyJsYW5nIjoiZW4iLCJtZXRyaWMiOmZhbHNlLCJwcm9maWxlIjp7InVzZXJuYW1lIjoiMzQzNzI4MDI1ODMyNCIsImxvY2FsZSI6ImVuX0dCIiwibWV0cmljIjpmYWxzZX19; kmt_sess.sig=DPU0-fe-LK1UjGfg-1ZmCugYtv0; _dd_s=rum=0&expire=1713885647619; koa_re=1745420746; koa_rt=3437280258324%7C%2F3437280258324%2Fkomoot-web%2F152967e5-c0f9-45af-aeb8-64d1162b3a3f%7C1745420746; koa_ae=1713886486; koa_at=3437280258324%7CeyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJydGkiOiI0NGNhZWQ5NTgwMmFjOGE3YTZkYTY4M2RjYmVjNGQ3OTFlZTgzODliMjZkMmZmZTE3ZjliMjc2NTE3YTc1NDJkIiwidXNlcl9uYW1lIjoiMzQzNzI4MDI1ODMyNCIsInNjb3BlIjpbInVzZXIuKiJdLCJleHAiOjE3MTM4ODY1NDYsImlhdCI6MTcxMzg4NDc0NiwianRpIjoiM2NiOTJmY2YtNTdkYy00NDgwLTg4ZjEtZDJmYThmODAwNDhkIiwiY2xpZW50X2lkIjoia29tb290LXdlYiIsInVzZXJuYW1lIjoiMzQzNzI4MDI1ODMyNCJ9.iw5NKjHUZkZ--mVw5FjpcaciKnjQJ-sEq3d24ILzKQfcd_KSyBdOvbew1NcamGkMeyxDHNDeZ1ZqJwDEs1z8LvgY3ZwBaBZvQmDivU4Gc0ri_aMyp32cI6FV2_tAylpfc89gc3m4w-olTd7tjueMHuYKIFL0UhMCKQEqwiFbCr5n-kE6xDOTaS2axGTjl2rH7v_q5LnBbUXI8slQRzKf634V0by54Uaia1FEnzwGDVe-VOTuvZc_nYNUyi9FOUHXRwsTM512N9RnqJ8XPyDMJAUDxUqnPAF7S7jrfjsWGgiXWTCaH-gcWMHrU38D9HSBLrRUqnvjd8h-ueQwbrovDw%7C1713886486"
}

async function getCards({ lat, lng }: { lat: number; lng: number }) {
  let allSpots: string[] = []
  try {
    const initialRes = await fetch(`${url}&lat=${lat}&lng=${lng}&page=0`, {
      method: 'GET', // or 'POST', etc.
      headers: headers,
      credentials: 'include'
    })
    
    const initialData = await initialRes.json();
    const totalPages = initialData.page.totalPages;
    console.log("Total Pages: " + totalPages);

    for (let page = 0; page < totalPages; page++) {
      console.log("Page: " + (page + 1) + "/" + totalPages);
      const pageRes = await fetch(`${url}&lat=${lat}&lng=${lng}&page=${page}`, {
        method: 'GET', // or 'POST', etc.
        headers: headers,
        credentials: 'include'
      })
      const pageData = await pageRes.json();
      const newSpots = pageData?._embedded?.items;

      console.log("Spots found: " + newSpots.length);
      const dbSpots = await prisma.spot.findMany({
        select: { komootId: true, deletedAt: true, id: true},
        where: { type: "MOUNTAIN_BIKING", komootId: { in: newSpots?.map((s: any) => s.id) } },
      })

      // number of new spots
      for (let index = 0; index < newSpots.length; index++) {
        const spot = newSpots[index]

        try {
          // if in db, continue
          const existingSpot = dbSpots.find((s) => s.komootId === spot.id)

          if (existingSpot?.deletedAt) {
            console.log("Spot already deleted: " + spot.link)
            continue
          }

          const data = {
            type: SpotType.MOUNTAIN_BIKING,
            komootId: spot.id,
            name: spot.name,
            createdAt: new Date(spot.date),
            latitude: spot.start_point.lat,
            longitude: spot.start_point.lng,
          }

          const detailPage = await fetch(`https://www.komoot.com/smarttour/${spot.id}`)
          const text = await detailPage.text()

          const $ = cheerio.load(text)

          let images: string[] = []
          $(".css-1ganbmd .css-1sjk0s2").each((_, img) => {
            const src = $(img).attr("data-src")
            if (src) images.push(src.split("?")[0])
          })
          const uniqueImages = new Set(images)

    
          if (existingSpot && existingSpot.deletedAt === null) {
            console.log(existingSpot && "Spot exists: " + "https://ramble.guide/spots/"+ existingSpot.id + " updating...")

            // Fetch existing images associated with the spot
            const existingImages = await prisma.spotImage.findMany({
              where: { spotId: existingSpot.id }, 
              include: { spot: true },
            });

            // If there is uniqueImages that are not in existingImages then add them
            const newImages = uniqueImages && Array.from(uniqueImages).filter(url => !existingImages.some(image => image.path === url));
            if (newImages.length > 0) {
              console.log("New images to add: " + newImages.map(image => image + " "))
              await prisma.spotImage.createMany({
                data: newImages.map((url) => ({
                  path: url,
                  spotId: existingSpot.id,
                  creatorId: "e48e35d0-6292-456e-80f1-d679a49e449d"
                })),
              });
            }
    
            // Iterate through existingImages and filter out images with 404 status
            const imagesToDelete = (await Promise.all(
              existingImages.map(async (image) => {
                const imageUrl = image.path; // Assuming 'path' is the property containing the image URL

                const isImageValid = await checkImageStatus(imageUrl);
                if (!isImageValid) {
                  console.log("Image not found: " + imageUrl);
                  return image; // Return the URL to be included in the output array
                }
                return null; // Return null for valid images
              })
            )).filter(Boolean); // Filter out null values to keep only invalid image URLs

            
            if (imagesToDelete.length > 0) {
              console.log("Images to delete: " + imagesToDelete.map(image => image?.path + " "))
            }
    
            // Delete images
            await Promise.all(imagesToDelete.map(async (image) => {
              // check if image is cover image
              if (image?.spot.coverId === image?.id) {
                await prisma.spot.update({
                  where: { id: image?.spot.id },
                  data: {
                    coverId: null,
                  },
                });
              }
              await prisma.spotImage.delete({
                where: { id: image?.id },
              });
            }));
          } else {
            console.log(
              "Adding new spot: " + index + " out of " + newSpots.length + " - " + (page + 1) + "/" + totalPages + " - " + lat + "," + lng + " ",
            )
            const newSpot = await prisma.spot.create({
              data: {
                ...data,
                verifiedAt: new Date(),
                images: {
                  create:
                    uniqueImages &&
                    Array.from(uniqueImages).map((url) => ({ path: url, creator: { connect: { email: "george@noquarter.co" } } })),
                },
                creator: { connect: { email: "george@noquarter.co" } },
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
      allSpots = [...allSpots, ...newSpots.map((s: any) => s.id)]
    }
    return allSpots
  } catch (error) {
    console.error("Failed to retrieve or process data:", error);
  }
}

async function main() {
  try {
    let scrapedIds: string[] = []
    // Start at 35, -10 for whole scan of europe
    for (let lat = 35; lat < 75; lat = lat + 7.5) {
      console.log("Lat: " + lat)
      for (let lng = -10; lng < 30; lng = lng + 7.5) {
        console.log("Lng: " + lng)
        const spotIds = await getCards({ lat, lng })
        if (spotIds) {
          scrapedIds = [...scrapedIds, ...spotIds]
        }
      }
    }

    const dbIds = await prisma.spot.findMany({select: {komootId: true, id: true}, where: {deletedAt: null, komootId: {not: null}, type: SpotType.MOUNTAIN_BIKING}})
    const spotsToDelete = dbIds.filter(dbId => dbId.komootId && !scrapedIds.includes(dbId.komootId)).map(dbId => dbId.id) as string[]

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
