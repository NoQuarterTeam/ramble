import { prisma } from "@ramble/database"
import { generateBlurHash } from "@ramble/api/src/services/generateBlurHash.server"

async function main() {
  const images = await prisma.spotImage.findMany({
    where: { blurHash: { equals: null }, spot: { verifiedAt: { not: null } } },
  })
  console.log(images.length, " images")

  for (const image of images) {
    const hash = await generateBlurHash(image.path)
    console.log("Hash generated")

    await prisma.spotImage.update({ where: { id: image.id }, data: { blurHash: hash } })
  }
}

main()
  .then(() => console.log("Done!"))
  .catch(console.log)
  .finally(() => prisma.$disconnect())
