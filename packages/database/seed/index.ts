import { prisma, SpotType } from ".."

import { faker } from "@faker-js/faker"

export async function main() {
  const admin = await prisma.user.upsert({
    create: {
      email: "jack@noquarter.co",
      password: "$2a$10$oNNINu1SnaMxZMRfz0HDduKX3BedpcP3y00A0k7tKbDQ4M.hYdiLq",
      firstName: "Jack",
      lastName: "Clackett",
    },
    update: {},
    where: { email: "jack@noquarter.co" },
  })

  const USER_COUNT = 50
  // Users
  for (let index = 0; index < USER_COUNT; index++) {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    await prisma.user.create({
      data: {
        email: faker.internet.email(firstName, lastName, "noquarter.co"),
        password: faker.internet.password(),
        firstName,
        lastName,
      },
    })
  }

  // Spots
  const types = [
    "CAFE",
    "CAMPING",
    "RESTAURANT",
    "PARKING",
    "BAR",
    "TIP",
    "SHOP",
    "CLIMBING",
    "MOUNTAIN_BIKING",
    "GAS_STATION",
    "SUPPING",
    "OTHER",
  ] as SpotType[]

  await prisma.spot.deleteMany({})

  const SPOT_COUNT = 100
  for (let index = 0; index < SPOT_COUNT; index++) {
    const randomUser = await prisma.user.findFirstOrThrow({
      skip: Math.floor(Math.random() * USER_COUNT),
    })
    const tenRandomUsers = await prisma.user.findMany({
      take: 10,
      skip: Math.floor(Math.random() * 50),
    })
    // date between 5 and 60 days ago
    const verifiedAt = new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000) + 5 * 24 * 60 * 60 * 1000)
    await prisma.spot.create({
      data: {
        verifiedAt,
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        latitude: parseFloat(faker.address.latitude(52, 42)),
        longitude: parseFloat(faker.address.longitude(8, -3)),
        images: {
          create: Array.from({ length: 5 }).map((_) => ({
            creator: { connect: { id: admin.id } },
            path: "https://picsum.photos/400/300",
          })),
        },
        reviews: {
          create: tenRandomUsers.map((user) => ({
            user: { connect: { id: user.id } },
            rating: Math.floor(Math.random() * 5) + 1,
            description: faker.lorem.paragraph(),
          })),
        },
        type: types[Math.floor(Math.random() * types.length)],
        address: faker.address.streetAddress(),
        creator: { connect: { id: randomUser.id } },
        verifier: { connect: { id: admin.id } },
      },
    })
  }
}

main()
  .catch(console.log)
  .finally(() => prisma.$disconnect())
