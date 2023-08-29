import { prisma } from "@ramble/database"
import { convert } from "html-to-text"

async function main() {
  const spots = await prisma.spot.findMany({
    where: { AND: [{ description: { not: null } }, { description: { not: { equals: "" } } }] },
    select: { id: true, description: true },
  })

  for (const spot of spots) {
    if (!spot.description) continue
    const description = convert(spot.description, { wordwrap: false, preserveNewlines: true })
    await prisma.spot.update({ where: { id: spot.id }, data: { description } }).catch()
  }
}

main()
  .catch(console.log)
  .finally(() => prisma.$disconnect())
