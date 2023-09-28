import * as cheerio from "cheerio"

const url = `https://terreinzoeker.natuurkampeerterreinen.nl/?terrain&open_at&property_id%5B0%5D=103&property_id%5B1%5D=5&action=terrain_results_loop&maptype=mapbox`

import { prisma } from "@ramble/database"

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
  const res = await fetch(url)
  const html = await res.text()
  const $ = cheerio.load(html)

  const newSpots = $(".terrain")

  for (let index = 0; index < newSpots.length; index++) {
    const spot = newSpots[index]
    console.log("Adding spot: " + index + " out of " + newSpots.length)
    try {
      const id = spot.attribs["data-item"]
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

      let images: string[] = []
      $(".c-terrain__media")
        .find("img")
        .map((_, image) => {
          const src = image.attribs.src
          if (src) images.push(src)
        })

      await prisma.spot.create({
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
          creator: { connect: { email: "george@noquarter.co" } },
          verifier: { connect: { email: "george@noquarter.co" } },
          images: { create: images.map((image) => ({ path: image, creator: { connect: { email: "george@noquarter.co" } } })) },
          amenities: {
            create: { shower, kitchen, firePit, wifi, toilet, water, electricity, hotWater },
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
