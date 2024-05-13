import puppeteer from "puppeteer"

const url = `https://www.homecamper.com/explore/Spain?types=minivans~motorhomes`

import { prisma } from "@ramble/database"

export type HomeSpot = {
  id: number
  latitude?: number
  longitude?: number
  name: string
  link: string
  images?: string[]
  address?: string
  description?: string
}

async function getPageCards(currentPage: number) {
  const browser = await puppeteer.launch({
    headless: false,
  })
  console.log(url)
  const page = await browser.newPage()

  const nug = await page.goto(url, {
    waitUntil: "domcontentloaded",
  })

  console.log(nug)

  let spots = [] as any[]
  // Get page data
  await page.$$eval(".lands", (cards) => {
    console.log(cards)
    return cards.map((card) => {
      console.log(card)
    })
    return
  })
  console.log(spots)

  await browser.close()
  const newData = await res.json()
  console.log(newData.parcels)
  const newSpots = newData?.parcels as any[]
  console.log("Spots found: " + newSpots.length)

  const dbSpots = await prisma.spot.findMany({
    select: { surflineId: true },
    where: { type: "SURFING", surflineId: { in: newSpots?.map((s) => s._id) } },
  })

  // number of new spots
  for (let index = 0; index < newSpots.length; index++) {
    const spot = newSpots[index]
    console.log("Adding spot: " + index + " out of " + newSpots.length)
    try {
      // if in db, continue
      const exists = dbSpots.find((s) => s.surflineId === spot._id)
      console.log(exists ? "Spot already exists" : "...")

      if (exists) continue
      // ridiculous slugifyier
      const slugName = spot.name
        .replace(/[À-ÿŽž]/g, "-")
        .replace(/[`~!@#$%^&*_|+\=?;:",.<>\{\}\[\]\\\/]/gi, "")
        .replace(/\s+/g, "-")
        .replace(/[(')]/gi, "-")
        .replace(/^-+|-+?=-|$/g, "")
        .toLowerCase()
        .replace(/(-)(?=\1)/gi, "")

      let formattedAbilityLevels = ""
      for (let index = 0; index < spot.abilityLevels.length; index++) {
        const isSecondLast = index === spot.abilityLevels.length - 2
        const isLast = index === spot.abilityLevels.length - 1
        formattedAbilityLevels =
          formattedAbilityLevels + spot.abilityLevels[index].toLowerCase() + (isSecondLast ? " and " : isLast ? " " : ", ")
      }

      let formattedBoardTypes = ""
      for (let index = 0; index < spot.boardTypes.length; index++) {
        const isSecondLast = index === spot.boardTypes.length - 2
        const isLast = index === spot.boardTypes.length - 1
        formattedBoardTypes =
          formattedBoardTypes + spot.boardTypes[index].toLowerCase() + (isSecondLast ? " and " : isLast ? "" : ", ")
      }

      let description = null

      if (spot.abilityLevels.length > 0) {
        description = "Suitable for " + formattedAbilityLevels + "surfers."
      }

      if (spot.boardTypes.length > 0 && spot.abilityLevels.length > 0) {
        description = description + " "
      }

      if (spot.boardTypes.length > 0) {
        description = description + "Bring your " + formattedBoardTypes + "."
      }

      const data = {
        type: SpotType.SURFING,
        surflineId: slugName + "/" + spot._id,
        name: spot.name,
        createdAt: new Date(),
        latitude: spot.lat,
        longitude: spot.lon,
        description,
      }

      await prisma.spot.create({
        data: {
          ...data,
          creator: { connect: { email: "george@noquarter.co" } },
        },
      })
    } catch (error) {
      console.log(error)
    }
  }
}

async function main() {
  const pageCount = 2
  try {
    // loop over each page
    for (let currentPage = 1; currentPage < pageCount + 1; currentPage++) {
      await getPageCards(currentPage)
    }
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main().finally(() => process.exit(0))
