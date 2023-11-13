import * as path from "path"
import { prisma } from "@ramble/database"
import * as fs from "fs"
const s3Url = `https://ramble.s3.amazonaws.com/assets/`

async function main() {
  const where = { deletedAt: null, verifiedAt: { not: null } }
  const totalSpotCount = await prisma.spot.count({ where })
  const BATCH_SIZE = 1000
  const numBatches = Math.ceil(totalSpotCount / BATCH_SIZE)

  for (let i = 0; i < numBatches; i++) {
    const spots = await prisma.spot.findMany({
      where,
      skip: i * BATCH_SIZE,
      take: BATCH_SIZE,
      select: {
        id: true,
        name: true,
        description: true,
        amenities: true,
        latitude: true,
        longitude: true,
        address: true,
        sourceUrl: true,
        isPetFriendly: true,
        type: true,
        createdAt: true,
        images: {
          select: {
            id: true,
            path: true,
            createdAt: true,
          },
        },
      },
    })

    fs.writeFileSync(
      path.join(__dirname, `spots-${i * BATCH_SIZE}-${(i + 1) * BATCH_SIZE}.json`),
      JSON.stringify(
        spots.map((spot) => ({
          ...spot,
          images: spot.images.map(({ path, ...image }) => ({
            ...image,
            url: path.startsWith("http") ? path : `${s3Url}${path}`,
          })),
        })),
      ),
    )
  }
}

main()
  .then(() => {
    console.log("Done!")
    process.exit(0)
  })
  .catch((error) => {
    console.log("Error", error)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
