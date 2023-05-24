import * as cheerio from "cheerio"
import * as puppeteer from "puppeteer"
import fs from "fs"

// const url = "https://www.pureportugal.co.uk/properties/?cat=54+54+99+54+54+54-&landmin=0&landmax=0&order=ASC&v="
const url = `https://campspace.com/en/campsites?location=&startDate=&endDate=&numberOfAdults=2&numberOfChildren=0&filter%5Baccommodations%5D%5B%5D=bring_motorhome&filter%5Baccommodations%5D%5B%5D=bring_minivan&filter%5Bsurfaces%5D%5B%5D=grass&filter%5BspaceSize%5D=no_maximum&filter%5Bamenities%5D%5B%5D=pets_allowed&filter%5Bactivities%5D%5B%5D=sightseeing&page=`
const pageCount = 9

import data from "./campspace.json"

export type Spot = {
  id: number
  latitude: number
  longitude: number
  name: string
  link: string
  images?: string[]
  address?: string
  description?: string
  isPetFriendly?: boolean
  hotWater?: boolean
  wifi?: boolean
  shower?: boolean
  toilet?: boolean
  kitchen?: boolean
  electricity?: boolean
  water?: boolean
  firePit?: boolean
  sauna?: boolean
  pool?: boolean
  bbq?: boolean
}

let currentData: Spot[] = data

async function getPageCards(page: puppeteer.Page, currentPage: number) {
  const res = await fetch(url + currentPage)
  const html = await res.text()

  const $ = cheerio.load(html)

  const spots: Spot[] = []

  $("article.card").each((_, card) => {
    const id = $(card).attr("data-id")
    const latitude = $(card).attr("data-lat")
    const longitude = $(card).attr("data-lng")
    const link = $(card).find(".card-header-a").attr("href")
    const name = $(card).find(".card-header-a").text()

    if (!id || !latitude || !longitude || !link || !name) return
    spots.push({
      id: parseInt(id),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      name,
      link,
    })
  })

  for (let index = 0; index < spots.length; index++) {
    const spot = spots[index]

    try {
      // if in data.json, continue
      const exists = currentData.find((s) => s.id === spot.id)
      if (exists) continue

      // use puppeteer to open link, parse html, and find the img with class "leaflet-marker-icon" and click it
      await page.goto(spot.link, { waitUntil: "domcontentloaded" })

      const html = await page.content()
      const $ = cheerio.load(html)

      let images: string[] = []
      $(".space-images .space-images--img").each((_, img) => {
        const src = $(img).attr("src")
        if (src) images.push(src.replace("teaser", "medium"))
      })
      const description = $(".about-popup .popup-body").html()?.trim() || ""

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

      currentData.push({
        ...spot,
        description,
        images,
        bbq,
        shower,
        kitchen,
        sauna,
        firePit,
        wifi,
        toilet,
        address,
        water,
        electricity,
        hotWater,
        pool,
        isPetFriendly,
      })
      fs.writeFileSync("./campspace.json", JSON.stringify(currentData, null, 2))
    } catch {}
  }
}

async function main() {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    // loop over each page
    for (let currentPage = 1; currentPage < pageCount + 1; currentPage++) {
      await getPageCards(page, currentPage)
    }
    await browser.close()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main().finally(() => process.exit(0))
