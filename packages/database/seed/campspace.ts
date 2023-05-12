import { prisma } from ".."
import data from "../campspace.json"

export async function main() {
  const admin = await prisma.user.findFirstOrThrow({ where: { email: "jack@noquarter.co" } })

  await Promise.all(
    data.map((spot) =>
      prisma.spot
        .upsert({
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
                bbq: spot.bbq || false,
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
                bbq: spot.bbq || false,
              },
            },
            name: spot.name,
            campspaceUrl: spot.link,
            address: spot.address,
            description: spot.description,
            type: "CAMPING",
            creator: { connect: { id: admin.id } },
          },
        })
        .catch((e) => {
          console.log(spot.id)
          console.log(e)
        }),
    ),
  )

  await Promise.all(
    data.map(
      async (spot) =>
        await prisma.spot.update({
          where: { campspaceId: spot.id },
          data: {
            images: {
              createMany: { skipDuplicates: true, data: spot.images.map((image) => ({ path: image, creatorId: admin.id })) },
            },
          },
        }),
    ),
  )
}

main()
  .catch(console.log)
  .finally(() => prisma.$disconnect())
