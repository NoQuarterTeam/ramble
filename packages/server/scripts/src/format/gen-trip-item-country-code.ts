import { prisma } from "@ramble/database"
import { COUNTRIES, geocodeCoords } from "@ramble/server-services"

async function main() {
  const tripItems = await prisma.tripItem.findMany({
    select: {
      id: true,
      stop: { select: { latitude: true, longitude: true } },
      spot: { select: { latitude: true, longitude: true } },
    },
    where: { countryCode: null },
  })

  for (const tripItem of tripItems) {
    const { latitude, longitude } = tripItem.spot
      ? { latitude: tripItem.spot.latitude, longitude: tripItem.spot.longitude }
      : tripItem.stop
        ? { latitude: tripItem.stop.latitude, longitude: tripItem.stop.longitude }
        : { latitude: undefined, longitude: undefined }
    if (!latitude || !longitude) continue
    const data = await geocodeCoords({ latitude, longitude })
    const countryCode = COUNTRIES.find((c) => c.name === data.country)?.code
    await prisma.tripItem.update({ where: { id: tripItem.id }, data: { countryCode } })
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
