import { prisma } from "@ramble/database"

import { confirmDeleteSpots } from './helpers/utils';
import { geocodeCoords } from '@ramble/server-services';
import { Prisma, SpotType } from '@ramble/database/types';

const URL = "https://camperguru.com/wp-json/camperguru/noquarter?token=8e27971684f13515ffca2d7065eb6840"

const flattenObjectToArray = (obj: any) => {
  return Object.keys(obj).map(key => ({
    id: key,
    ...obj[key]
  }));
};

async function main() {
  try {
    const res = await fetch(URL)
    const rawData = await res.json() as RawData
    const spotsData = flattenObjectToArray(rawData) as SpotData
    console.log(spotsData.length + " spots found")

    // create and update new spots
    for (const spotData of spotsData) {
      if (!spotData.camper_type.includes("camper")) continue
      const address = await geocodeCoords({ latitude: parseFloat(spotData.latitude), longitude: parseFloat(spotData.longitude) })
      const addressToUse = address?.address || address?.place
      const data = {
        name: spotData.title,
        latitude: parseFloat(spotData.latitude),
        longitude: parseFloat(spotData.longitude),
        address: addressToUse,
        description: spotData.content,
        creator: { connect: { email: "george@noquarter.co" } },
        type: spotTypeFormat[spotData.spot_type[0] as CamperGuruSpotType] as SpotType,
        camperguruId: parseInt(spotData.id),
        sourceUrl: spotData.url,
        isPetFriendly: spotData.feature.includes("Pet Friendly")
      } satisfies Prisma.SpotCreateInput

      const bbq = spotData.feature.includes("Barbecue")
      const electricity = spotData.feature.includes("Electricity")
      const water = spotData.feature.includes("Freshwater")
      const shower = spotData.feature.includes("Shower")
      const toilet = spotData.feature.includes("Toilets")
      const wifi = spotData.feature.includes("WiFi")

      const amenities = { bbq, shower, wifi, toilet, water, electricity }

      const spot = await prisma.spot.upsert({
        where: { camperguruId: parseInt(spotData.id) },
        create: { ...data, amenities: {
            create: amenities,
          },
        },
        update: {...data, amenities: {
            update: amenities
        },},
      })

      try {
        spotData.gallery.forEach(async (image, index) => {
          if (!image) return
          // Check if the image already exists for the spot
          const existingImage = await prisma.spotImage.findFirst({
            where: {
              path: image,
              spotId: spot.id,
            },
          });
          if (existingImage) return
          index === 0 ?
            await prisma.spotImage.create({
              data: {
                spot: { connect: { id: spot.id } },
                coverSpot: { connect: { id: spot.id } },
                path: image,
                creator: { connect: { email: "george@noquarter.co" } },
              },
            })
            :
            await prisma.spotImage.create({
              data: {
                spot: { connect: { id: spot.id } },
                path: image,
                creator: { connect: { email: "george@noquarter.co" } },
              },
            }) 
        })
      } catch {}
    }

    const dbIds = await prisma.spot.findMany({select: {camperguruId: true, id: true}, where: {deletedAt: null, camperguruId: {not: null}}})
    const spotsToDelete = dbIds.filter(dbId => dbId.camperguruId && spotsData && !spotsData.map(spot => spot.id).includes(dbId.camperguruId.toString())).map(dbId => dbId.id) as string[]

    if (spotsToDelete.length > 0) {
      await confirmDeleteSpots(spotsToDelete)
    } else {
      console.log("No spots to delete");
    }
    console.log("Done!");
    return Response.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.log(error)
    return Response.json({ ok: false }, { status: 500 })
  }
}

main().finally(() => process.exit(0))


type CamperGuruSpotType =
  | "Campsite"
  | "Nature spot"
  | "Winery"
  | "Camper park"
  | "Farm"
  | "Golf Course"
  | "Marina"
  | "Parking"
  | "Private spot"
  | "Restaurant"


const spotTypeFormat = {
  "Camper park": "VAN_PARK",
  "Campsite": "CAMPING",
  "Nature spot": "ROADSIDE",
  "Winery": "PRIVATE_LAND",
  "Farm": "PRIVATE_LAND",
  "Golf Course": "CARPARK",
  "Marina": "VAN_PARK",
  "Parking": "CARPARK",
  "Private spot": "PRIVATE_LAND",
  "Restaurant": "CARPARK"
} satisfies Record<CamperGuruSpotType, SpotType>;

type RawData = {
  id: {
    title: string
    content: string
    date: string
    url: string
    latitude: string
    longitude: string
    thumbnail: string
    feature: string[]
    spot_type: SpotType[]
    emblem: string
    booking: boolean
    country: string[]
    camper_type: string[]
    gallery: string[]
    parking_lots: string
    book: string | null
  }
}[]

type SpotData = {
  id: string,
  title: string
  content: string
  date: string
  url: string
  latitude: string
  longitude: string
  thumbnail: string
  feature: string[]
  spot_type: SpotType[]
  emblem: string
  booking: boolean
  country: string[]
  camper_type: string[]
  gallery: string[]
  parking_lots: string
  book: string | null
}[]