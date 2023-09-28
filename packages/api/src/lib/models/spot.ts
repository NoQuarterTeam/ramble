import { PrismaClient } from "@ramble/database/types"
import { SpotItemWithStatsAndImage } from "@ramble/shared"
import { LatestSpotImages, joinSpotImages, spotImagesRawQuery } from "../../shared/spot.server"

export const fetchAndJoinSpotImages = async (prisma: PrismaClient, spots: SpotItemWithStatsAndImage[]) => {
  // get spot images and join to original spot payload
  const images = spots.length > 0 && (await prisma.$queryRaw<LatestSpotImages>(spotImagesRawQuery(spots.map((s) => s.id))))
  images && joinSpotImages(spots, images)
}
