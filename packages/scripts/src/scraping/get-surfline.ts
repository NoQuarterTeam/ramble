import * as cheerio from "cheerio"

// surf
const url = `https://services.surfline.com/kbyg/mapview?south=21.37124437061832&west=-42.62695312500001&north=61.39671887310414&east=40.25390625000001`

// import exampleData from "./surfline.json"

import { prisma } from "@ramble/database"
import { SpotType } from "@ramble/database/types"

async function getCards() {
  const res = await fetch(url)
  const newData = await res.json()
    const newSpots = newData?.data.spots as any[]
    console.log("Spots found: " + newSpots.length)
    const dbSpots = await prisma.spot.findMany({
      select: { surflineId: true },
      where: { type: "SURFING", surflineId: { in: newSpots?.map((s) => s._id) } },
    })

    // number of new spots
    for (let index = 0; index < newSpots.length; index++) {
      const spot = newSpots[index]
      console.log("Adding spot: " + index + " out of " + newSpots.length)
      try {
        // if in db, continue
        const exists = dbSpots.find((s) => s.surflineId === spot._id)
        console.log(exists ? "Spot already exists" : "...")

        if (exists) continue
        // ridiculous slugifyier
        const slugName = spot.name.replace(/[À-ÿŽž]/g, "-").replace(/[`~!@#$%^&*_|+\=?;:",.<>\{\}\[\]\\\/]/gi, '').replace(/\s+/g, '-').replace(/[(')]/gi,'-').replace(/^-+|-+?=-|$/g, '').toLowerCase().replace(/(-)(?=\1)/gi, "");
        
        let formattedAbilityLevels = ""
        for (let index = 0; index < spot.abilityLevels.length; index++) {
          const isSecondLast = index === spot.abilityLevels.length - 2
          const isLast = index === spot.abilityLevels.length - 1
          formattedAbilityLevels = formattedAbilityLevels + spot.abilityLevels[index].toLowerCase() + (isSecondLast ? " and " : isLast ? " " : ", ")
        }

        let formattedBoardTypes = ""
        for (let index = 0; index < spot.boardTypes.length; index++) {
          const isSecondLast = index === spot.boardTypes.length - 2
          const isLast = index === spot.boardTypes.length - 1
          formattedBoardTypes = formattedBoardTypes + spot.boardTypes[index].toLowerCase() + (isSecondLast ? " and " : isLast ? "" : ", ")
        }

        let description = null

        if (spot.abilityLevels.length > 0) {
          description = "Suitable for " + formattedAbilityLevels + "surfers."
        } 
        
        if(spot.boardTypes.length > 0 && spot.abilityLevels.length > 0) {
          description = description + " "
        } 
        
        if(spot.boardTypes.length > 0) {
          description = description + "Bring your " + formattedBoardTypes + "."
        }

        
        const data = {
          type: SpotType.SURFING,
          surflineId: slugName + "/" + spot._id,
          name: spot.name,
          createdAt: new Date(),
          latitude: spot.lat,
          longitude: spot.lon,
          description
        }

        await prisma.spot.create({
          data: {
            ...data,  
            creator: { connect: { email: "george@noquarter.co" } },
          },
        })
      } catch (error) {
        console.log(error)
      }
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

main()
  .then(() => {
    console.log("Done!")
  })
  .finally(() => process.exit(0))
