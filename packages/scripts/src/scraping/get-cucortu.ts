import * as cheerio from "cheerio"

const url = `https://cucortu.ro/toate?regions=&filters=by_car%2Cby_caravan&lang=en`

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

  const newSpots = $(".camping-wrapper")

  const dbSpots = await prisma.spot.findMany({
    select: { cucortuId: true },
    where: { type: "CAMPING", cucortuId: { in: newSpots.toArray().map((s) => s.attribs["data-id"]) } },
  })

  for (let index = 0; index < newSpots.length; index++) {
    const spot = newSpots[index]
    const id = spot.attribs["data-id"]

    const exists = dbSpots.find((s) => s.cucortuId === id)

    console.log(exists && "Spot exists: " + id)
    if (exists) continue

    console.log("Adding spot: " + index + " out of " + newSpots.length)

    const linkElement = spot.children[1] as cheerio.Element
    try {
      const link = linkElement.attribs.href

      const detailPage = await fetch(link)
      const detailPageEnglish = await fetch(link + "?lang=en")

      const spotDetailHtml = await detailPage.text()
      const spotDetailHtmlEnglish = await detailPageEnglish.text()

      const $ = cheerio.load(spotDetailHtml)
      const $$ = cheerio.load(spotDetailHtmlEnglish)

      const name = $(".cucortu-camping-title").text().trim()
      const description =
        $$(".description-container .camp-raspuns").text().trim() === "No description"
          ? $(".description-container .camp-raspuns").text().trim()
          : $$(".description-container .camp-raspuns").text().trim()

      const coords = $(".directions").find("a").attr("href")?.split("=")[1]
      const latitude = coords && parseFloat(coords.split(",")[0])
      const longitude = coords && parseFloat(coords.split(",")[1])
      if (!latitude || !longitude) return
      const isPetFriendly = $$(".camping-facility").find("span").text().includes("Pet Friendly")

      // const address = $("#contact").next().find("span").html()?.replaceAll("<br>", ", ").trim()

      const kitchen = $$(".camping-facility").find("span").text().includes("Kitchen")
      const electricity = $$(".camping-facility").find("span").text().includes("Electricity")
      const hotWater = $$(".camping-facility").find("span").text().includes("Hot water")
      const water = $$(".camping-facility").find("span").text().includes("Water")
      const shower = $$(".camping-facility").find("span").text().includes("Showers")
      const toilet = $$(".camping-facility").find("span").text().includes("Wc")
      // const wifi = $$(".camping-facility").find("span").text().includes("Kitchen")
      // const firePit = $$(".camping-facility").find("span").text().includes("Kitchen")

      let images: string[] = []

      $(".owl-carousel")
        .find("img")
        .map((_, image) => {
          const src = "https://cucortu.ro" + image.attribs.src
          if (src) images.push(src)
        })

      await prisma.spot.create({
        data: {
          cucortuId: id,
          name: name,
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
            create: { shower, kitchen, toilet, water, electricity, hotWater },
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
