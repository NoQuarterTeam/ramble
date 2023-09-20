import * as cheerio from "cheerio"

const url = `https://www.neste.nl/neste-my-renewable-diesel/distributeurs`

import { prisma } from "@ramble/database"

export type Spot = {
  id: string
  name: string
  address: string
  imageUrl: string
  latitude?: number
  longitude?: number
}

async function getCards() {
  const res = await fetch(url)
  const html = await res.text()

  const $ = cheerio.load(html)

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
      address,
      imageUrl:
        "https://lh3.googleusercontent.com/IT2gbAip6StRHkmGQis6wbbjvXSebPK9GvLab4Ml8bCfG8DCJSDG5oxSepshXBQfCj9zudEUSW7Y85yx0ZXmLtu31TOxsnek5NLzcSXog9TGJdYYB2x4CJED2iE1zmDZuhlGuR5a",
    })
  })
  const existingSpots = await prisma.spot.findMany({ where: { nesteId: { in: spots.map((s) => s.id) } } })

  for (let index = 0; index < spots.length; index++) {
    const spot = spots[index]

    try {
      // if in data.json, continue
      const exists = existingSpots.find((s) => s.nesteId === spot.name)
      if (exists) continue

      // geocode to get lat and lng based on address with mapbox
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          spot.address,
        )}.json?access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
      )
      const json = await res.json()

      await prisma.spot.create({
        data: {
          name: spot.name,
          address: spot.address,
          latitude: json.features[0].center[1],
          longitude: json.features[0].center[0],
          creator: { connect: { email: "george@noquarter.co" } },
          verifier: { connect: { email: "george@noquarter.co" } },
          nesteId: spot.name,
          type: "GAS_STATION",
          images: { create: [{ path: spot.imageUrl, creator: { connect: { email: "george@noquarter.co" } } }] },
        },
      })
    } catch {}
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
