import * as cheerio from "cheerio"
import * as puppeteer from "puppeteer"
import fs from "fs"

const url = `https://www.komoot.com/api/v007/discover_tours/?srid=4326&format=simple&fields=timeline&timeline_highlights_fields=images,start_point&limit=100&max_distance=30000&sport=mtb&lat=52.3759&lng=4.8975&page=0&hl=en`

import data from "./komoot.json"
import { add } from "cheerio/lib/api/traversing"

export type Spot = {
  id: string
  name: string
  imageUrl: string
  latitude?: number
  longitude?: number
}

let currentData: Spot[] = data

async function getData(page: puppeteer.Page) {
  const res = await fetch(url)
  const html = await res.text()

  const spots: Spot[] = []

  $(".map-marker-list-item").each((_, card) => {
    const id = $(card).attr("id")

    // use cheerio to return the name based on the class neste-map-item-title which is a child of a child of the card
    const name = $(card).find(".neste-map-item-title span").text()
    const address = $(card).find(".neste-map-item-info").text().trim()
    const carIcon = $(card).find(".neste-map-list-icon-car-show")

    if (!id || !name || !address || !carIcon) return
    spots.push({
      id,
      name,
      latitude,
      longitude,
      imageUrl:
        "https://lh3.googleusercontent.com/IT2gbAip6StRHkmGQis6wbbjvXSebPK9GvLab4Ml8bCfG8DCJSDG5oxSepshXBQfCj9zudEUSW7Y85yx0ZXmLtu31TOxsnek5NLzcSXog9TGJdYYB2x4CJED2iE1zmDZuhlGuR5a",
    })
  })

  for (let index = 0; index < spots.length; index++) {
    const spot = spots[index]

    try {
      // if in data.json, continue
      const exists = currentData.find((s) => s.id === spot.id)
      if (exists) continue

      fs.writeFileSync("./komoot.json", JSON.stringify(currentData, null, 2))
    } catch {}
  }
}

async function main() {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await getData(page)

    await browser.close()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main().finally(() => process.exit(0))
