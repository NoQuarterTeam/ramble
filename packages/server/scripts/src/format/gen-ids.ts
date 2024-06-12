import { prisma } from "@ramble/database"
import { customAlphabet } from "nanoid"

async function main() {
  const count = await prisma.spot.count({ where: { nanoid: null } })

  // batch into 1000s

  for (let i = 5000; i < count; i += 1000) {
    const spots = await prisma.spot.findMany({
      take: 1000,
      skip: i,
      where: { nanoid: null },
      select: { id: true },
    })

    for (const spot of spots) {
      const id = customAlphabet("abcdefghjkmnpqrstuvwxyz2345678ABCDEFGHJKLMPQRSTUVXYZ")(8)
      await prisma.spot.update({ where: { id: spot.id }, data: { nanoid: id } })
    }
  }
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
