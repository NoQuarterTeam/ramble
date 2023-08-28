import * as cheerio from "cheerio"

const url = `https://www.park4night.com/api/places/around?lang=en&filter=%7B%22type%22:[%22ACC_G%22],%22services%22:[],%22activities%22:[],%22maxHeight%22:%220%22%7D&radius=200&`

// lat=48.25744095909484&lng=3.3044850246652686
import exampleData from "./park4night.json"
import { prisma } from ".."
import { SpotType } from "../types"

async function getCards({ lat, lng }: { lat: number; lng: number }) {
  // const fixes = await prisma.spot.findMany({
  //   select: { id: true, name: true },
  //   where: { type: "FREE_CAMPING", name: { startsWith: "-" } },
  // })

  // for (let index = 0; index < fixes.length; index++) {
  //   const spot = fixes[index]
  //   const newNameWithoutHypenAtStart = spot.name.replace(/^-/, "").trim()
  //   await prisma.spot.update({ where: { id: spot.id }, data: { name: newNameWithoutHypenAtStart } })
  // }

  // return

  const res = await fetch(url + `lat=${lat}&lng=${lng}`)
  const newSpots = (await res.json()) as typeof exampleData

  console.log(newSpots.length)

  const dbSpots = await prisma.spot.findMany({
    select: { park4nightId: true },
    where: { type: "FREE_CAMPING", park4nightId: { in: newSpots.map((s) => s.id) } },
  })

  // number of new spots

  for (let index = 0; index < newSpots.length; index++) {
    const spot = newSpots[index]

    try {
      // if in db, continue
      const exists = dbSpots.find((s) => s.park4nightId === spot.id)

      if (exists) continue
      const data = {
        type: SpotType.FREE_CAMPING,
        park4nightId: spot.id,
        address: spot.address.street + ", " + spot.address.city + ", " + spot.address.country + ", " + spot.address.zipcode,
        name: spot.title_short.replace(/\([^)]*-(?:[^)]*)\)\s*/, "").trim(),
        createdAt: new Date(spot.created_at),
        description: spot.description,
        latitude: spot.lat,
        longitude: spot.lng,
        isPetFriendly: spot.services.includes("animaux"),
      }
      const amenities = {
        hotWater: false,
        wifi: spot.services.includes("wifi"),
        shower: spot.services.includes("douche"),
        toilet: spot.services.includes("wc_public"),
        kitchen: false,
        electricity: spot.services.includes("electricite"),
        water: spot.services.includes("point_eau"),
        firePit: false,
        sauna: false,
        pool: spot.services.includes("piscine"),
        bbq: false,
      }

      const detailPage = await fetch(`https://www.park4night.com/en/place/${spot.id}`)
      const text = await detailPage.text()

      const $ = cheerio.load(text)

      let images: string[] = []
      $(".place-header-gallery-image").each((_, img) => {
        const href = $(img).attr("href")
        if (href) images.push(href)
      })

      await prisma.spot.upsert({
        where: { park4nightId: spot.id },
        update: { ...data, amenities: { update: amenities } },
        create: {
          ...data,
          amenities: { create: amenities },
          images: {
            create: images.map((url) => ({ path: url, creator: { connect: { email: "jack@noquarter.co" } } })),
          },
          creator: { connect: { email: "jack@noquarter.co" } },
        },
      })
    } catch {}
  }
}

async function main() {
  try {
    // lat and lng coords of europe in large squares

    await getCards({ lat: 45.00885571770821, lng: -0.8788928050084053 })
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main().finally(() => process.exit(0))

// interface Coordinates {
//   lat: number
//   lng: number
// }
// function distance(coord1: Coordinates, coord2: Coordinates): number {
//   const { lat: lat1, lng: lon1 } = coord1
//   const { lat: lat2, lng: lon2 } = coord2

//   const toRadians = (degrees: number): number => (degrees * Math.PI) / 180

//   const R = 6371 // Radius of the Earth in kilometers
//   const φ1 = toRadians(lat1)
//   const φ2 = toRadians(lat2)
//   const Δφ = toRadians(lat2 - lat1)
//   const Δλ = toRadians(lon2 - lon1)

//   const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
//   const distance = R * c

//   return distance
// }

// function generateEuropeCoverage(radius: number): Coordinates[] {
//   const europeCenter: Coordinates = { lat: 54.526, lng: 15.2551 } // Approximate center point of Europe
//   const interval = 0.5 // Adjust the interval based on your needs

//   const coords: Coordinates[] = []
//   const latLimit = 90
//   const lngLimit = 180

//   for (let lat = -latLimit; lat <= latLimit; lat += interval) {
//     for (let lng = -lngLimit; lng <= lngLimit; lng += interval) {
//       const coord: Coordinates = { lat, lng }

//       if (distance(coord, europeCenter) <= radius) {
//         coords.push(coord)
//       }
//     }
//   }

//   return coords
// }

// // Example usage:
// const radius = 200 // Desired radius in kilometers

// const europeCoords = generateEuropeCoverage(radius)
// console.log(europeCoords)
// console.log(europeCoords)
