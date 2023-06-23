import * as cheerio from "cheerio"
import * as puppeteer from "puppeteer"
import fs from "fs"

const url = `https://www.neste.nl/neste-my-renewable-diesel/distributeurs`

import data from "./neste.json"
import { add } from "cheerio/lib/api/traversing"

export type Spot = {
  id: string
  name: string
  address: string
  imageUrl: string
  latitude?: number
  longitude?: number
}

let currentData: Spot[] = data

async function getCards(page: puppeteer.Page) {
  const res = await fetch(url)
  const html = await res.text()

  const $ = cheerio.load(html)

  const spots: Spot[] = []

  $(".map-marker-list-item").each((_, card) => {
    const id = $(card).attr("id")

    // use cheerio to return the name based on the class neste-map-item-title which is a child of a child of the card
    const name = $(card).find(".neste-map-item-title span").text()
    const address = $(card).find(".neste-map-item-info").text()
    const carIcon = $(card).find(".neste-map-list-icon-car-show")

    if (!id || !name || !address || !carIcon) return
    spots.push({
      id,
      name,
      address,
      imageUrl:
        "https://lh3.googleusercontent.com/IT2gbAip6StRHkmGQis6wbbjvXSebPK9GvLab4Ml8bCfG8DCJSDG5oxSepshXBQfCj9zudEUSW7Y85yx0ZXmLtu31TOxsnek5NLzcSXog9TGJdYYB2x4CJED2iE1zmDZuhlGuR5a",
    })
  })

  for (let index = 0; index < spots.length; index++) {
    const spot = spots[index]

    try {
      // if in data.json, continue
      const exists = currentData.find((s) => s.name === spot.name)
      if (exists) continue

      // geocode to get lat and lng based on address with mapbox
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          spot.address,
        )}.json?access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
      )
      const json = await res.json()

      currentData.push({
        ...spot,
        latitude: json.features[0].center[0],
        longitude: json.features[0].center[1],
      })

      fs.writeFileSync("./neste.json", JSON.stringify(currentData, null, 2))
    } catch {}
  }
}

async function main() {
  try {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await getCards(page)

    await browser.close()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main().finally(() => process.exit(0))
