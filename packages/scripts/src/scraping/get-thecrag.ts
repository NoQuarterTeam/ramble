import * as cheerio from "cheerio"

const url = `https://www.thecrag.com/en/climbing/europe/routes/with-stars/1/with-gear-style/boulder/?sortby=popularity,desc`

const pageCount = 77

import { prisma } from "@ramble/database"
import { convert } from "html-to-text"
import { Prisma, SpotType } from "@ramble/database/types"

export type CragSpot = {
  id: string
  latitude: number
  longitude: number
  name: string
  link: string
  images?: string[]
  address?: string
  description?: string
}

async function getPageCards(currentPage: number) {
  const res = await fetch(url + `&page=${currentPage}`)
  const html = await res.text()

  const $ = cheerio.load(html)

  const spots: { id: string; link: string }[] = []

  // loop over table

  $("table tr.actionable").each((_, row) => {
    const id = $(row).attr("id")
    const link = $(row).find(".rt_name a").attr("href")
    if (!id || !link) return console.log("no id or link", id, link)
    spots.push({ id, link: `https://www.thecrag.com${link}` })
  })

  const currentData = await prisma.spot.findMany({
    where: { theCragId: { in: spots.map((s) => s.id) } },
  })

  console.log({ spotsCount: spots.length })

  for (let index = 0; index < spots.length; index++) {
    const spot = spots[index]

    try {
      // if in db, continue
      const exists = currentData.find((s) => s.theCragId === spot.id)
      if (exists) {
        console.log("Already exists:", spot.id)

        continue
      }

      console.log("Fetching spot:", spot.link)
      let spotDetail = await fetch(spot.link)

      let spotDetailHtml = await spotDetail.text()

      if (spotDetailHtml.includes("You have exceeded your allowed anonymous requests")) {
        throw new Error("Rate limited")
        // await new Promise((res) => setTimeout(res, 10000))
        // spotDetail = await fetch(spot.link)
        // spotDetailHtml = await spotDetail.text()
        // if (spotDetailHtml.includes("You have exceeded your allowed anonymous requests")) {
        //   console.log("Rated limited");
        // }
      }

      const $ = cheerio.load(spotDetailHtml)

      const name = $(".heading__t")
        .find("span")
        ?.filter(function () {
          return $(this).attr("itemprop") === "name"
        })
        ?.first()
        ?.text()
        ?.trim()

      if (!name) {
        console.log(spotDetailHtml)
        console.log("no name", spot.id, spot.link)
        continue
      }
      const grade = $(".heading__t .grade").text().replace("{FB}", "").trim()
      if (!grade) {
        console.log("no grade", spot.id, spot.link)
        continue
      }

      const strLongitude = $("meta[property=place:location:longitude]").attr("content")
      const strLatitude = $("meta[property=place:location:latitude]").attr("content")

      let images: string[] = []
      $(".phototopo img").each((_, img) => {
        const url = $(img).attr("data-big")
        if (!url) return
        images.push(url)
      })
      $(".photo-list img").each((_, img) => {
        const url = $(img).attr("data-src")
        if (!url) return
        images.push(url)
      })
      if (!strLongitude || !strLatitude) {
        console.log("no lat or long", strLatitude, strLongitude)
        continue
      }

      const description = convert($("meta[name=description]").attr("content")?.replace(":camera:", "").trim() || "", {
        wordwrap: false,
        preserveNewlines: true,
      })

      const data = {
        name: `${grade} boulder: ${name}`,
        latitude: parseFloat(strLatitude),
        longitude: parseFloat(strLongitude),
        description,
        theCragId: String(spot.id),
        type: "CLIMBING" as SpotType,
        isPetFriendly: true,
        sourceUrl: spot.link,
        creator: { connect: { email: "jack@noquarter.co" } },
        verifier: { connect: { email: "jack@noquarter.co" } },
        verifiedAt: new Date(),
        images: { create: images.map((url) => ({ path: url, creator: { connect: { email: "jack@noquarter.co" } } })) },
      } satisfies Prisma.SpotCreateArgs["data"]

      // console.log({ data })

      // continue
      await prisma.spot.create({ data }).catch((e) => {
        console.log("Error", data)
        console.log(e)
      })
      console.log("Spot created: ", spot.link)

      await new Promise((res) => setTimeout(res, 1000))
    } catch (e) {
      console.log(e)
      throw new Error()
    }
  }
}

async function main() {
  try {
    // loop over each page
    for (let currentPage = 4; currentPage < pageCount + 1; currentPage++) {
      console.log({ currentPage })

      await getPageCards(currentPage)
    }
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main().finally(() => process.exit(0))
