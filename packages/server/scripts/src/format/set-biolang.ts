import { prisma } from "@ramble/database"
import { getLanguage } from "@ramble/server-services"

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, bio: true }, where: { bio: { not: null } } })

  for (const user of users) {
    if (!user.bio) continue
    const bioLanguage = await getLanguage(user.bio)
    await prisma.user.update({ where: { id: user.id }, data: { bioLanguage } })
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
