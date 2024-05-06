import { AppCta } from "@/components/AppCta"
import { PageContainer } from "@/components/PageContainer"
import { Avatar, Badge } from "@/components/ui"
import { db } from "@/lib/server/db"
import { createAssetUrl } from "@ramble/shared"
import { unstable_cache } from "next/cache"

const getGuides = unstable_cache(
  () => {
    return db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        username: true,
        _count: {
          select: {
            createdSpots: { where: { sourceUrl: { equals: null }, deletedAt: null, verifiedAt: { not: null } } },
            createdTrips: true,
            followers: true,
          },
        },
      },
      where: { role: "GUIDE" },
      orderBy: { createdAt: "desc" },
    })
  },
  ["guides"],
  { revalidate: 86400, tags: ["guides"] },
)

export default async function Page() {
  const guides = await getGuides()

  return (
    <PageContainer>
      <div className="space-y-10 pb-20">
        {guides.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-10">
            <p className="text-xl">No guides yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {guides.map((guide) => (
              <GuideItem key={guide.id} guide={guide} />
            ))}
          </div>
        )}
        <AppCta message="Download the app to see more guides" />
      </div>
    </PageContainer>
  )
}

function GuideItem({ guide }: { guide: Awaited<ReturnType<typeof getGuides>>[0] }) {
  return (
    <div className="p-6 border rounded-sm space-y-6">
      <div className="flex space-x-4 items-center">
        <Avatar className="w-[100px] h-[100px]" src={createAssetUrl(guide.avatar)} size={200} />
        <div className="space-y-1">
          <Badge size="sm" colorScheme="green">
            Guide
          </Badge>
          <p className="text-2xl leading-7 font-semibold">
            {guide.firstName} {guide.lastName}
          </p>
          <p className="text-xl leading-5">{guide.username}</p>
        </div>
      </div>
      <div className="flex items-center justify-around text-center">
        <div className="flex-1">
          <p>
            <b>{guide._count.followers}</b> followers
          </p>
        </div>
        <div className="flex-1">
          <p>
            <b>{guide._count.createdSpots}</b> spots
          </p>
        </div>
        <div className="flex-1">
          <p>
            <b>{guide._count.createdTrips}</b> trips
          </p>
        </div>
      </div>
    </div>
  )
}
