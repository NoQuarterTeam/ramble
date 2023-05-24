import { prisma } from ".."
import data from "../campspace.json"

export async function main() {
  const admin = await prisma.user.findFirstOrThrow({ where: { email: "jack@noquarter.co" } })

  const spots = await prisma.spot.findMany()
  await Promise.all(
    data
      .filter((s) => s.images.length > 2 && s.description.length > 50 && !spots.find((spot) => spot.campspaceId === s.id))
      .map((spot) =>
        prisma.spot.upsert({
          where: { campspaceId: spot.id },
          create: {
            campspaceId: spot.id,
            latitude: spot.latitude,
            longitude: spot.longitude,
            isPetFriendly: spot.isPetFriendly,
            name: spot.name,
            campspaceUrl: spot.link,
            address: spot.address,
            description: spot.description,
            type: "CAMPING",
            amenities: {
              create: {
                hotWater: spot.hotWater,
                wifi: spot.wifi,
                shower: spot.shower,
                toilet: spot.toilet,
                kitchen: spot.kitchen,
                electricity: spot.electricity,
                water: spot.hotWater,
                firePit: spot.firePit,
                sauna: spot.sauna,
                pool: spot.pool,
                bbq: spot.bbq,
              },
            },
            creator: { connect: { id: admin.id } },
          },
          update: {
            latitude: spot.latitude,
            longitude: spot.longitude,
            isPetFriendly: spot.isPetFriendly,
            amenities: {
              update: {
                hotWater: spot.hotWater,
                wifi: spot.wifi,
                shower: spot.shower,
                toilet: spot.toilet,
                kitchen: spot.kitchen,
                electricity: spot.electricity,
                water: spot.hotWater,
                firePit: spot.firePit,
                sauna: spot.sauna,
                pool: spot.pool,
                bbq: spot.bbq,
              },
            },
            name: spot.name,
            campspaceUrl: spot.link,
            address: spot.address,
            description: spot.description,
            type: "CAMPING",
            creator: { connect: { id: admin.id } },
          },
        }),
      ),
  )

  await prisma.spotImage.deleteMany({})

  await Promise.all(
    data
      .filter((s) => s.images.length > 2 && s.description.length > 50)
      .map(async (spot) => {
        await prisma.spot.update({
          where: { campspaceId: spot.id },
          data: {
            images: {
              createMany: { skipDuplicates: true, data: spot.images.map((image) => ({ path: image, creatorId: admin.id })) },
            },
          },
        })
      }),
  )
}

main()
  .catch(console.log)
  .finally(() => prisma.$disconnect())
