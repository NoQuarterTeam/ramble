import { prisma } from "@ramble/database"

export async function spotVerifyOrRemove(spots: { sourceUrl: string }[]) {
  for (const spot of spots) {
    const res = await fetch(spot.sourceUrl)
    console.log(res.ok, res.status, res.redirected, res.url, spot.sourceUrl)

    if (!res.ok || res.status === 301 || res.redirected) {
      const res1 = await fetch(res.url)
      const spotId = (await prisma.spot.findFirstOrThrow({ where: { sourceUrl: spot.sourceUrl }, select: { id: true } })).id

      if (
        !res1.ok ||
        res1.status === 301 ||
        res1.redirected ||
        (spot.sourceUrl.includes("camperspace") && !res1.url.includes("/s/")) ||
        (spot.sourceUrl.includes("hipcamp") && res1.url.includes("/d/"))
      ) {
        console.log("Removing spot: " + spotId)
        await prisma.spot.update({ where: { id: spotId }, data: { closedAt: new Date() } })
      } else if (res1.ok && !res1.redirected) {
        console.log("Update sourceUrl for spot: " + spotId)
        await prisma.spot.update({ where: { id: spotId }, data: { sourceUrl: res1.url } })
      }
    }
  }
}
