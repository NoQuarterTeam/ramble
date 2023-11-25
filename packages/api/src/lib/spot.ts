import { type PrismaClient } from "@ramble/database/types"
import { joinSpotImages, type LatestSpotImages, spotImagesRawQuery } from "@ramble/server-services"
import { type SpotItemWithStatsAndImage } from "@ramble/shared"

export const fetchAndJoinSpotImages = async (prisma: PrismaClient, spots: SpotItemWithStatsAndImage[]) => {
  // get spot images and join to original spot payload
  const images = spots.length > 0 && (await prisma.$queryRaw<LatestSpotImages>(spotImagesRawQuery(spots.map((s) => s.id))))
  images && joinSpotImages(spots, images)
}
