import { prisma } from "@ramble/database"
import { generateBlurHash } from "@ramble/server-services"

async function main() {
  const images = await prisma.spotImage.findMany({
    take: 2000,
    skip: 0,
    orderBy: { createdAt: "desc" },
    where: {
      blurHash: { equals: null },
      // coverSpot: { isNot: null },
      spot: { type: { equals: "CAMPING" }, verifiedAt: { not: null }, deletedAt: null },
    },
  })
  console.log(images.length, " images")

  for (const image of images) {
    const hash = await generateBlurHash(image.path)
    await prisma.spotImage.update({ where: { id: image.id }, data: { blurHash: hash } })
  }
}

main()
  .then(() => console.log("Done!"))
  .catch(console.log)
  .finally(() => prisma.$disconnect())
