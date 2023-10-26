import * as path from "path"
import { prisma } from "@ramble/database"
import * as fs from "fs"
import { stringify } from "csv-stringify/sync"
const s3Url = `https://ramble.s3.amazonaws.com/assets/`

async function main() {
  // the good images need to be batched as theres more than 100k
  let images = await prisma.spotImage.findMany({
    where: { spot: { deletedAt: null } },
    take: 100000,
    select: {
      id: true,
      path: true,
      spotId: true,
      createdAt: true,
    },
  })

  console.log("good", images.length)

  fs.writeFileSync(
    path.join(__dirname, "images.csv"),
    stringify(
      images.map(({ path, ...i }) => ({
        id: i.id,
        url: path.startsWith("http") ? path : `${s3Url}${path}`,
        spot_id: i.spotId,
        created_at: new Date(i.createdAt).toISOString(),
      })),
      { header: true },
    ),
  )

  let deletedSpotImages = await prisma.spotImage.findMany({
    take: 100000,
    where: { spot: { deletedAt: { not: { equals: null } } } },
    select: {
      id: true,
      path: true,
      spotId: true,
      createdAt: true,
    },
  })

  console.log("deleted", deletedSpotImages.length)

  fs.writeFileSync(
    path.join(__dirname, "bad-images.csv"),
    stringify(
      deletedSpotImages.map(({ path, ...i }) => ({
        id: i.id,
        url: path.startsWith("http") ? path : `${s3Url}${path}`,
        spot_id: i.spotId,
        created_at: new Date(i.createdAt).toISOString(),
      })),
      { header: true },
    ),
  )
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
