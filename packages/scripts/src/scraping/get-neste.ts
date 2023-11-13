import nesteData from "./data/neste.json"

import { prisma } from "@ramble/database"

export type Spot = {
  nesteId: string
  name: string
  description: string
  sourceUrl: string
  address: string
  images: { create: { path: string; creator: { connect: { email: string } } }[] }
  latitude: number
  longitude: number
  creator: { connect: { email: string } }
  verifier: { connect: { email: string } }
  type: "GAS_STATION"
}

const description =
  "Neste MY Renewable DieselTM (HVO100) is fully compatible with all diesel engines and current diesel fuel distribution infrastructure – from refinery to service stations and end-users. Neste MY Renewable Diesel has a similar chemical composition to fossil diesel. This means that it is a drop-in replacement for fossil diesel. A drop-in fuel can be used without any modifications, neat or blended at any ratio with fossil diesel. The use of Neste MY Renewable Diesel, made from 100% renewable raw materials, can result in up to 90% less greenhouse gas (GHG or CO2e) emissions* over the fuel’s life cycle when compared with fossil diesel. Make a difference today by switching to renewable diesel."

async function getCards() {
  const newData = nesteData as typeof nesteData
  const currentData = await prisma.spot.findMany({
    where: { nesteId: { in: newData.map((n) => n.nid.toString()) } },
  })

  for (const neste of newData) {
    const exists = currentData.find((s) => s.nesteId === neste.nid.toString())

    if (exists) {
      console.log("exists")
      continue
    }

    if (!neste.vehicles.includes("car")) continue
    if (!neste.lat || !neste.lng) continue

    await prisma.spot.create({
      data: {
        nesteId: neste.nid.toString(),
        name: decodeURIComponent(neste.title),
        description,
        address: decodeURIComponent(
          neste.company_name +
            ", " +
            neste.station_name +
            ", " +
            neste.street +
            ", " +
            neste.city.value +
            ", " +
            neste.state.value +
            ", " +
            neste.country.value +
            ", " +
            neste.postal_code,
        ),
        latitude: neste.lat,
        longitude: neste.lng,
        creator: { connect: { email: "george@noquarter.co" } },
        verifier: { connect: { email: "george@noquarter.co" } },
        type: "GAS_STATION",
        sourceUrl: "https://www.neste.be/en/neste-my-renewable-diesel-be",
        images: {
          create: [
            {
              path: "https://lh3.googleusercontent.com/IT2gbAip6StRHkmGQis6wbbjvXSebPK9GvLab4Ml8bCfG8DCJSDG5oxSepshXBQfCj9zudEUSW7Y85yx0ZXmLtu31TOxsnek5NLzcSXog9TGJdYYB2x4CJED2iE1zmDZuhlGuR5a",
              creator: { connect: { email: "george@noquarter.co" } },
            },
          ],
        },
      },
    })
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
