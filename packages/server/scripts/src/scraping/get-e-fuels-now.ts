import * as fs from "node:fs"
import { prisma } from "@ramble/database"
import { geocodeAddress } from "@ramble/server-services"
import { convert } from "html-to-text"

const email = "george@noquarter.co"

// Function to generate a unique ID based on object content
function generateUniqueId(dataObj: any) {
  const uniqueString = `${dataObj.latitude}${dataObj.longitude}`.replace(/[.-]/g, "")
  return uniqueString
}

async function main() {
  try {
    // Read the JSON file
    const data = fs.readFileSync("../../../../tank-stations.json", "utf8")

    // Parse the JSON data
    const json = JSON.parse(data)
    const featurePromises = await json.features.map(async (feature: any) => {
      const address = feature.properties.Adresse

      let latitude = feature.geometry.coordinates[1]
      let longitude = feature.geometry.coordinates[0]

      if (latitude === 0.0 || longitude === 0.0) {
        const coords = await geocodeAddress({ address })
        if (!coords) return null
        latitude = coords[1]
        longitude = coords[0]
      }

      const eFuelsNowId = generateUniqueId({ latitude, longitude })

      if (!eFuelsNowId) {
        return null
      }

      return {
        name: feature.properties.Name,
        description:
          "HVO-100 (Hydrotreated Vegetable Oil) is a renewable diesel fuel made from vegetable oils, animal fats, and waste cooking oils through a hydrotreatment process. It is chemically similar to fossil diesel but offers several environmental benefits, including significantly reduced greenhouse gas emissions, lower particulate matter, and NOx emissions. HVO-100 can be used in conventional diesel engines without modifications, making it a viable alternative to fossil diesel for reducing carbon footprints and improving air quality.",
        address: address,
        latitude: latitude,
        longitude: longitude,
        eFuelsNowId: eFuelsNowId,
      }
    })

    // Wait for all features to be processed
    const features = await Promise.all(featurePromises)

    for (let feature of features) {
      if (feature === null) {
        continue
      }

      await prisma.spot
        .create({
          data: {
            eFuelsNowId: feature.eFuelsNowId,
            name: feature.name,
            description: convert(feature.description, { wordwrap: false, preserveNewlines: true }),
            address: feature.address,
            latitude: feature.latitude,
            longitude: feature.longitude,
            creator: { connect: { email: email } },
            verifier: { connect: { email: email } },
            type: "GAS_STATION",
            sourceUrl: "https://efuelsnow.de/tankstellen-karte",
          },
        })
        .catch((error) => {
          console.log(error)
          return null
        })
    }

    console.log("Features saved successfully")
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main().finally(() => process.exit(0))
