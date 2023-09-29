import * as cheerio from "cheerio"

const url = `https://www.loodusegakoos.ee/where-to-go/search-options?element_holder%5Bobject_type%5D%5B%5D=Campsite&search=1&search_type=Puhkeala&element%5Btitle%5D=#tulemus`

import { prisma } from "@ramble/database"

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

  const newSpots = $(".result-row")

  for (let index = 0; index < 10; index++) {
    const spot = $(newSpots[index])
    const link = "https://www.loodusegakoos.ee" + spot.find("a").attr("href")

    const name = spot.find(".location-name a").text().trim()
    const description = spot.find(".location-sightseeing").text().trim()
    const firePit = spot.find(".ico-fireplace").length > 0

    try {
      const detailPage = await fetch(link)
      const spotDetailHtml = await detailPage.text()

      const $ = cheerio.load(spotDetailHtml)

      const isCampsite = $("table td").text().includes("Campsite")
      const suitableForVans = $("tr td").text().includes("Parking for")

      if (!isCampsite || !suitableForVans) continue

      const id = link.split("/")?.[link.split("/").length - 1]

      const dbSpots = await prisma.spot.findMany({
        select: { loodusegakoosId: true },
        where: { type: "CAMPING", loodusegakoosId: { in: newSpots.toArray().map((s) => id) } },
      })

      const exists = dbSpots.find((s) => s.loodusegakoosId === id)
      console.log(exists && "Spot exists: " + id)

      // if (exists) continue

      console.log("Adding spot: " + index + " out of " + newSpots.length)

      const coords = $("table td").text().split("latitude")[1]
      const latitude = coords && parseFloat(coords.split("longitude")[0].split(" ")[1])
      const longitude = coords && parseFloat(coords.split("longitude")[1].split(" ")[1])

      if (!latitude || !longitude) return

      const toilet = $("tr td").text().includes("toilet")

      let images: string[] = []

      $(".edys-gallery")
        .find("a")
        .map((_, image) => {
          const src = "https:" + image.attribs.href
          if (src) images.push(src)
        })

      console.log(images)
      await prisma.spot.create({
        data: {
          loodusegakoosId: id,
          name: name,
          latitude: latitude,
          longitude: longitude,
          description,
          type: "CAMPING",
          sourceUrl: link,
          isPetFriendly: true,
          creator: { connect: { email: "george@noquarter.co" } },
          verifier: { connect: { email: "george@noquarter.co" } },
          images: { create: images.map((image) => ({ path: image, creator: { connect: { email: "george@noquarter.co" } } })) },
          amenities: {
            create: {
              shower: false,
              kitchen: false,
              toilet,
              water: false,
              electricity: false,
              hotWater: false,
              firePit,
              wifi: false,
            },
          },
        },
      })
    } catch (error) {
      console.log(error)
    }
  }
}

async function main() {
  try {
    await getCards()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main().finally(() => process.exit(0))
