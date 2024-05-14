import { prisma } from "@ramble/database"
import { geocodeCoords } from "@ramble/server-services"

async function main() {
  const spots = await prisma.spot.findMany({
    select: { id: true, latitude: true, longitude: true },
    take: 500,
    orderBy: { createdAt: "desc" },
    where: { type: "CAMPING", address: null },
  })

  for (const spot of spots) {
    const address = await geocodeCoords({ latitude: spot.latitude, longitude: spot.longitude })
    const addressToUse = address?.address || address?.place
    await prisma.spot.update({ where: { id: spot.id }, data: { address: addressToUse } })
  }
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(() => {
    console.log("done")
    process.exit(0)
  })
