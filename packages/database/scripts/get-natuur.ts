import * as cheerio from "cheerio"

import fs from "fs"

const url = `https://terreinzoeker.natuurkampeerterreinen.nl/?terrain=&property_id%5B%5D=103&open_at=&action=terrain_results_loop&maptype=mapbox`

import data from "./natuur.json"

export type Spot = {
  id: string
  name: string
  address: string
  imageUrl: string
  latitude?: number
  longitude?: number
}

let currentData: Spot[] = data

async function getCards() {
  const res = await fetch(url)
  const html = await res.text()

  const $ = cheerio.load(html)

  const spots: Spot[] = []
  console.log($("#terrain-results-loop").children())
  $("#terrain-results-loop").each((_, card) => {
    if (card.type === "script") return
    const id = $(card).find(".c-results__item-wrap").find(".terrain").attr("data-item")
    const name = $(card).find(".c-results__item-wrap").find(".c-results__name").text()
    const address = $(card).find(".c-results__item-wrap").find(".c-results__address ").text()
    const imageUrl = $(card).find(".c-results__item-wrap").find(".c-results__preview").attr("src")

    if (!id || !name || !address || !imageUrl) return
    spots.push({
      id,
      name,
      address,
      imageUrl,
    })
    console.log(spots)
  })

  // for (let index = 0; index < spots.length; index++) {
  //   const spot = spots[index]

  //   try {
  //     // if in data.json, continue
  //     const exists = currentData.find((s) => s.name === spot.name)
  //     if (exists) continue

  //     // geocode to get lat and lng based on address with mapbox
  //     const res = await fetch(
  //       `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
  //         spot.address,
  //       )}.json?access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
  //     )
  //     const json = await res.json()

  //     currentData.push({
  //       ...spot,
  //       latitude: json.features[0].center[0],
  //       longitude: json.features[0].center[1],
  //     })

  //   } catch {}
  // }
  fs.writeFileSync("./natuur.json", JSON.stringify(spots, null, 2))
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
