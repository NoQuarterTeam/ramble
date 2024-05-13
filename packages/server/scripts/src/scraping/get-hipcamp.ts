import { prisma } from "@ramble/database"
import { gql, GraphQLClient } from "graphql-request"

import { confirmDeleteSpots } from './helpers/utils';

const LIMIT = 2000

const ROOT_URL = "https://www.hipcamp.com"
const camperEndpoint = ROOT_URL + "/graphql/camper"
const searchEndpoint = ROOT_URL + "/graphql/search"

const headers = {
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-GB,en;q=0.9",
  Connection: "keep-alive",
  "Content-Length": "2771",
  "Content-Type": "application/json",
  Cookie: `_ga_0V3NPH9SPM=GS1.1.1699355851.8.1.1699356027.39.0.0; _hc_client_platform=web; VERCEL_COUNTRY_CODE=NL; _hipcamp_session=TEtuTUMzL3Rqb2Q1Qkc2MmRBMlhxMXgrTnRNNTc4TjBCUkRrQlJ2TkRTQVNrOFlIR09nVFRuZzhoS2twUTBHLzR5ajZPQUhraDY1QmgzTHRjbitIRm5mL1N2Y2c4WGJqL2VWS2MvMXc3K21tYWMxbGx5eTRVaG9FYTU0TzA1aVJRTDFPVDZ6dkFndzNPMWEwTWpsMzZXTFVCbXNNeisvbHNudHgzUU5uOHJaK21GTlpjL0Vod09HaFNpRXZMT1NHY3Q2UWlZNDNsZnlNV096Nk9Hd0E2SDRiVFVWNXFjNkZ1OTFmZjI0NDdMNFpXVnZZa0dtMGV6MnpUQ1lEalp3M0lkZUhVd0g3aHRQNVdwZE1JTy9HOC95dUcrd3BWbXNHa3ppU0NmeVdhNndtVG9uWWE5NTJUUFN3bVE5TzVwT0trdmFvMXpuc0JxSlNxZ0Q5aDluaWpLdVRWTFQ0Y1NIVVNidWZ1TFBrRFN3PS0talY2ZytUZ0JySzZVUUVKZWVpMXV3Zz09--487caf8732913130e4274efb44363ccb527ccbf0; _clsk=c8art8|1699355919715|5|1|e.clarity.ms/collect; _fbp=fb.1.1699020933735.1703850302; _gcl_au=1.1.1744191174.1699020919; _uetsid=2e467dd07c9411eeaeadede798fa41df; ajs_anonymous_id=61c1d451-c169-406d-bccb-3305bea23fb4; analytics_session_id=1699355851805; analytics_session_id.last_access=1699355918678; _uetvid=cf9d21707a5211ee9f3195d1b1911fd5; _pin_unauth=dWlkPU5XTmxZbVF3TVdJdFlXVTJZaTAwTmpsbUxXSmtaVGN0T0RKaVkyVTRZemRpWVdGag; _ga=GA1.1.965831542.1699020650; _rdt_uuid=1699020650455.721943d9-8e2c-4ab4-966b-f09c8bd944ba; NEXT_LOCALE=en-GB; _clck=g6f7gm|2|fgi|0|1402; hc_signing_up_as_host=false; g_state={"i_p":1699366403775,"i_l":2}; _tt_enable_cookie=1; _ttp=NaigimKAJ0s95wwl_lYGS80rUAR; _hc_anonymous_id=61c1d451-c169-406d-bccb-3305bea23fb4; _hc_assignment_id=8f190803-f6f5-4b74-91b9-63deb67209f1; ajs_anonymous_id=%2261c1d451-c169-406d-bccb-3305bea23fb4%22`,
  "hipcamp-api-key": "Dp7qfhE8y8cTx73qSYu8b6M2",
  "hipcamp-platform": "Web",
  Host: "www.hipcamp.com",
  Origin: "https://www.hipcamp.com",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
}


const search = new GraphQLClient(searchEndpoint, { headers })
const camper = new GraphQLClient(camperEndpoint, { headers })

const searchQuery = gql`
  query Lands($landFilter: LandFilterInput!, $privateOffset: Int, $privateLimit: Int) {
    lands(landFilter: $landFilter) {
      privateLands(offset: $privateOffset, limit: $privateLimit) {
        total
        edges {
          node {
            name
            cityName
            countyName
            stateName
            url
            coordinate {
              latitude
              longitude
            }
            topPhotos {
              urls(variant: CAROUSEL_SMALL) {
                url
              }
            }
          }
        }
      }
    }
  }
`
const landQuery = gql`
  query Land($landId: ID!, $landIdType: LandIdTypeEnum!) {
    land(landId: $landId, landIdType: $landIdType) {
      overview
    }
  }
`
const landSitesQuery = gql`
  query LandSitesSearch($landId: ID!, $landIdType: LandIdTypeEnum!, $siteFilter: SiteFilterInput!) {
    land(landId: $landId, landIdType: $landIdType) {
      sites(siteFilter: $siteFilter) {
        edges {
          node {
            amenities(amenityType: SITE) {
              slug
              state
            }
          }
        }
      }
    }
  }
`

interface LandRes {
  land: {
    overview: string
  }
}
interface LandSitesRes {
  land: {
    sites: {
      edges: [
        {
          node: {
            amenities: [
              {
                slug: string
                state: string
              },
            ]
          }
        },
      ]
    }
  }
}
interface SearchRes {
  lands: {
    privateLands: {
      total: number
      edges: [
        {
          node: {
            name: string
            cityName: string
            countyName: string
            stateName: string
            url: string
            coordinate: {
              latitude: string
              longitude: string
            }
            topPhotos: [
              {
                urls: [
                  {
                    url: string
                  },
                ]
              },
            ]
          }
        },
      ]
    }
  }
}

async function run(bbox: {southwestLatitude: number, southwestLongitude: number, northeastLatitude: number, northeastLongitude: number}) {
  const errors: unknown[] = []
  let count = 0
  try {
    const searchVariables = {
      landFilter: {
        accommodations: ["rv-motorhomes", "vehicles"],
        boundingBox: bbox,
      },
      privateOffset: 0,
      privateLimit: LIMIT,
    }

    const searchRes: SearchRes = await search.request(searchQuery, searchVariables)

    const total = searchRes.lands.privateLands.total
    const results = searchRes.lands.privateLands.edges.length
    console.log("TOTAL:", total)
    console.log("RESULTS:", results)
    console.log()

    if (total > results) {
      console.log(" ----------- WARNING ----------")
      console.log("You're leaving spots on the table bruv")
    }


    const nodes = searchRes.lands.privateLands.edges.map((edge) => edge.node)

    // console.dir(nodes, { depth: null })

    const existingHipcampSpots = await prisma.spot.findMany({
      where: { hipcampId: { not: { equals: null } } },
    })
    

    for (const node of nodes) {
      try {
        count++
        process.stdout.clearLine(0)
        process.stdout.cursorTo(0)
        process.stdout.write(`Processing: ${count}/${results} `)

        const last = node.url.split("-").length - 1
        const landId = node.url.split("-")[last]

        const existingSpot = existingHipcampSpots.find((s) => s.hipcampId === landId)

        if (existingSpot?.deletedAt) {
          console.log("Spot already deleted: " + "https://www.hipcamp.com/" + node.url)
          continue
        }
        
        const landRes: LandRes = await camper.request(landQuery, { landId, landIdType: "MASKED" })
        const land = landRes.land
        const landSitesRes: LandSitesRes = await camper.request(landSitesQuery, { landId, landIdType: "MASKED", siteFilter: {} })
        
        const amenities =
        landSitesRes.land.sites.edges.length > 0
        ? landSitesRes.land.sites.edges[0].node.amenities.map((amenity) => ({
          slug: amenity.slug,
          state: amenity.state,
        }))
        : []
        const firePit = !!amenities.find((amenity) => amenity.slug === "fire" && amenity.state === "PRESENT")
        const toilet = !!amenities.find((amenity) => amenity.slug === "toilet" && amenity.state === "PRESENT")
        const water = !!amenities.find((amenity) => amenity.slug === "water" && amenity.state === "PRESENT")
        const electricity = !!amenities.find((amenity) => amenity.slug === "electricity-hookup" && amenity.state === "PRESENT")
        
        // console.dir(amenities, { depth: null })
        // console.dir(landRes, { depth: null })
        const images = node.topPhotos.flatMap((topPhoto) => topPhoto.urls.map((url) => url.url))
      

        if (existingSpot && existingSpot.deletedAt === null) {
          console.log(existingSpot && "Spot exists: " + "https://ramble.guide/spots/"+ existingSpot.id + " updating...")
          await prisma.spot.update({
            where: { hipcampId: landId },
            data: {
              hipcampId: landId,
              name: node.name,
              latitude: parseFloat(node.coordinate.latitude),
              longitude: parseFloat(node.coordinate.longitude),
              address: [node.cityName, node.countyName, node.stateName].filter((e) => !!e).join(", "),
              type: "CAMPING",
              creator: { connect: { email: "dan@noquarter.co" } },
              sourceUrl: ROOT_URL + node.url,
              description: land.overview,
              images: {
                create: (await Promise.all(images.map(async (imagePath) => {
                  // Check if the image already exists for the spot
                  const existingImage = await prisma.spotImage.findFirst({
                    where: {
                      path: imagePath,
                      spotId: existingSpot.id,
                    },
                  });
          
                  // If the image doesn't exist, create it
                  if (!existingImage) {
                    return {
                      path: imagePath,
                      creator: { connect: { email: "jack@noquarter.co" } },
                    };
                  }
          
                  // If the image already exists, return an empty object to skip its creation
                  return {};
                }))).filter(image => Object.keys(image).length !== 0) as { path: string; creator: { connect: { email: string } } }[], // Filter out null values (indicating duplicates)
              },
              amenities: {
                update: {
                  bbq: false,
                  shower: false,
                  kitchen: false,
                  sauna: false,
                  firePit,
                  wifi: false,
                  toilet,
                  water,
                  electricity,
                  hotWater: false,
                  pool: false,
                },
              },
            },
          })
          if (existingSpot.coverId === null) {
            // Find the corresponding image of the first image in the images array
            const firstImage = await prisma.spotImage.findFirst({where: {spotId: existingSpot.id, path: images[0]}, select: {id: true}})
  
            if (firstImage) {
              await prisma.spot.update({
                where: { id: existingSpot.id },
                data: {
                  cover: { connect: { id: firstImage?.id }}
                },
              });
            }
          }

           // Fetch existing images associated with the spot
          const existingImages = await prisma.spotImage.findMany({
            where: { spotId: existingSpot.id }, 
            include: { spot: true },
          });

          // Find images to delete (images that are not in the images array)
          const imagesToDelete = existingImages.filter(image => !images.includes(image.path));

          if (imagesToDelete.length > 0) {
            console.log("images to delete: " + imagesToDelete.map(image => image.path + " ,"))
          }

          // Delete images
          await Promise.all(imagesToDelete.map(async (image) => {
            // check if image is cover image
            if (image.spot.coverId === image.id) {
              await prisma.spot.update({
                where: { id: image.spot.id },
                data: {
                  coverId: null,
                },
              });
            }
            await prisma.spotImage.delete({
              where: { id: image.id },
            });
          }));
        } else {
          console.log("Adding new spot: " + node.url)

          const newSpot = await prisma.spot.create({
            data: {
              hipcampId: landId,
              name: node.name,
              latitude: parseFloat(node.coordinate.latitude),
              longitude: parseFloat(node.coordinate.longitude),
              address: [node.cityName, node.countyName, node.stateName].filter((e) => !!e).join(", "),
              type: "CAMPING",
              creator: { connect: { email: "dan@noquarter.co" } },
              sourceUrl: ROOT_URL + node.url,
              description: land.overview,
              images: { create: images.map((image) => ({ path: image, creator: { connect: { email: "dan@noquarter.co" } } })) },
              amenities: {
                create: {
                  bbq: false,
                  shower: false,
                  kitchen: false,
                  sauna: false,
                  firePit,
                  wifi: false,
                  toilet,
                  water,
                  electricity,
                  hotWater: false,
                  pool: false,
                },
              },
            },
          })

          if (newSpot.coverId === null) {
            const firstImage = await prisma.spotImage.findFirst({where: {spotId: newSpot.id, path: images[0]}, select: {id: true}})
            await prisma.spot.update({
              where: { id: newSpot.id },
              data: {
                cover: { connect: { id: firstImage?.id }},
              },
            });
          }

        }
      } catch (e) {
        console.log("error attempting ", node.url)
        console.log(e)
        errors.push(e)
        continue
      }
    }
    return nodes.map((node) => node.url.split("-")[node.url.split("-").length - 1]) 
  } catch (e) {
    console.log("---------- ERROR ----------")
    console.log(e)
  }
  if (errors.length > 0) {
    console.log("ERRORS:", errors.length)
    console.log("-------------------------------")
    console.log(errors)
  }
}


async function main() {
  try {
    const bboxs = [
      // uk
      {
        southwestLatitude: 49.15437455073152,
        southwestLongitude: -14.155521505444824,
        northeastLatitude: 59.064346051468334,
        northeastLongitude: 1.9696403331486465,
      },
      // // france, spain, portugal
      {
        southwestLatitude: 34.26465635258491,
        southwestLongitude: -13.909058402557605,
        northeastLatitude: 51.24275392456704,
        northeastLongitude: 8.235671705008116,
      },
      // rest of europe
      {
        southwestLatitude: 32.51242431674814,
        southwestLongitude: 6.64222969997283,
        northeastLatitude: 59.8403587102855,
        northeastLongitude: 45.25582584298422,
      }
    ]

    let scrapedIds: string[] = []
    // loop over each page
    for (const bbox of bboxs) {
      const spotIds = await run(bbox);
      if (spotIds && spotIds.length > 0) {
        scrapedIds = [...scrapedIds, ...spotIds]
      }
    }

    const dbIds = await prisma.spot.findMany({select: {hipcampId: true, id: true}, where: {deletedAt: null, hipcampId: {not: null}}})
    const spotsToDelete = dbIds.filter(dbId => dbId.hipcampId && !scrapedIds.includes(dbId.hipcampId)).map(dbId => dbId.id) as string[]

    // ask for a command confirmation before continuing
    if (spotsToDelete.length > 0) {
      await confirmDeleteSpots(spotsToDelete)
    } else {
      console.log("No spots to delete");
    }

  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main()
  .then(() => {
    console.log("\n")
    console.log("-------------------")
    console.log("Done!")
  })
  .finally(() => process.exit(0))
