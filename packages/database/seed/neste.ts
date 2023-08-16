import { prisma } from ".."
import data from "../scripts/neste.json"

export async function main() {
  const admin = await prisma.user.findFirstOrThrow({ where: { email: "jack@noquarter.co" } })

  await Promise.all(
    data
      .filter((s) => !!s.latitude && !!s.longitude)
      .map(async (spot) => {
        await prisma.spot
          .upsert({
            where: { nesteId: spot.name },
            create: {
              nesteId: spot.name,
              latitude: spot.latitude || 0,
              longitude: spot.longitude || 0,
              name: spot.name,
              address: spot.address,
              images: {
                create: {
                  creatorId: admin.id,
                  path: spot.imageUrl,
                },
              },
              type: "GAS_STATION",
              creator: { connect: { id: admin.id } },
            },
            update: {
              nesteId: spot.name,
              latitude: spot.latitude,
              longitude: spot.longitude,
              name: spot.name,
              address: spot.address,
            },
          })
          .catch(console.log)
      }),
  )
}

main()
  .catch(console.log)
  .finally(() => prisma.$disconnect())
