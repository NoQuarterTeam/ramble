import { generateBlurHash } from "@ramble/api/src/services/generateBlurHash.server"
import { prisma } from ".."

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
