import { prisma } from "@ramble/database"
import { updateLoopsContact } from "@ramble/server-services"

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, _count: { select: { createdSpots: true, createdTrips: true } } },
  })

  for (const user of users) {
    updateLoopsContact({
      email: user.email,
      hasCreatedSpot: user._count.createdSpots > 0,
      hasCreatedTrip: user._count.createdTrips > 0,
    })
    await new Promise((resolve) => setTimeout(resolve, 100))
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
