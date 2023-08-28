import { prisma } from "@ramble/database"
import { generateBlurHash } from "../services/generateBlurHash.server"

async function main() {
  const images = await prisma.spotImage.findMany({
    where: { blurHash: { equals: null } },
  })
  console.log(images.length)

  for (const image of images) {
    const hash = await generateBlurHash(image.path)
    await prisma.spotImage.update({ where: { id: image.id }, data: { blurHash: hash } })
  }
}

main()
  .catch(console.log)
  .finally(() => prisma.$disconnect())
