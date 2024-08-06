import { prisma } from "@ramble/database"
import { geocodeAddress } from '@ramble/server-services';
import fs from 'fs'

const email = "george@noquarter.co";

// Function to extract postcode from the address
function extractPostcode(address: any) {
  const match = address.match(/\d{4,5}/);
  return match ? match[0] : null;
}

function generateId(postcode: any, lat: any, lng: any) {
  return postcode ? `${postcode}${lat.toFixed(2).replace('.', '')}${lng.toFixed(2).replace('.', '')}` : null;
}

async function main() {
  try {
    // Read the JSON file
    const data = fs.readFileSync("../../../../tank-stations.json", 'utf8');
  
    // Parse the JSON data
    const json = JSON.parse(data);
    const featurePromises = await json.features.map(async (feature: any) => {
      const address = feature.properties.Adresse;
      const postcode = extractPostcode(address);
      let latitude = feature.geometry.coordinates[1];
      let longitude = feature.geometry.coordinates[0];
      
      if (latitude === 0.0 || longitude === 0.0) {
        const coords = await geocodeAddress(address)
        if (!coords) return null;
        latitude = coords[1];
        longitude = coords[0];
      }

      const eFuelsNowId = generateId(postcode, latitude, longitude);  // This is the postcode and coords mixed
      return {
        name: feature.properties.Name,
        description: feature.properties.description,
        address: address,
        latitude: latitude,
        longitude: longitude,
        eFuelsNowId: eFuelsNowId
      };
    });

    // Wait for all features to be processed
    const features = await Promise.all(featurePromises);


    for (let feature of features) {
      if (feature === null) {
        continue;
      }

      await prisma.spot.create({
        data: {
          eFuelsNowId: feature.eFuelsNowId, 
          name: feature.name,
          description: feature.description,
          address: feature.address,
          latitude: feature.latitude,
          longitude: feature.longitude,
          creator: { connect: { email: email } },
          verifier: { connect: { email: email } },
          type: "GAS_STATION",
          sourceUrl: "https://efuelsnow.de/tankstellen-karte",
        },
      });
    }

    console.log("Features saved successfully");
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main().finally(() => process.exit(0))
