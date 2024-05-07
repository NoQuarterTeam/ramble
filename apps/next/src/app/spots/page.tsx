import { AppCta } from "@/components/AppCta"
import { PageContainer } from "@/components/PageContainer"
import { SpotIcon } from "@/components/SpotIcon"
import { SpotItem } from "@/components/SpotItem"
import { Button, IconButton } from "@/components/ui"
import { db } from "@/lib/server/db"
import type { SpotType } from "@ramble/database/types"
import { spotListQuery } from "@ramble/server-services"
import { STAY_SPOT_TYPE_OPTIONS, type SpotItemType, type SpotListSort } from "@ramble/shared"
import { unstable_cache } from "next/cache"
import { SpotSort } from "./SpotSort"

const TAKE = 24
const getSpots = unstable_cache(
  ({ type, sort = "latest" }: { type?: SpotType; sort?: SpotListSort }) => {
    return db.$queryRaw<Array<SpotItemType>>`${spotListQuery({ type, sort, take: TAKE })}`
  },
  ["spots"],
  { revalidate: 86400, tags: ["spots"] },
)

export default async function Page({ searchParams: { type, sort } }: { searchParams: { type?: SpotType; sort?: SpotListSort } }) {
  const spots = await getSpots({ type, sort })

  return (
    <PageContainer className="pt-0">
      <div className="sticky top-nav z-[1] bg-background py-4">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex gap-1">
            <form method="get">
              <input type="hidden" name="sort" value={sort || ""} />
              <Button type="submit" variant={!type ? "primary" : "outline"} name="type" value="">
                All
              </Button>
            </form>
            {STAY_SPOT_TYPE_OPTIONS.map(({ value, label }) => (
              <form key={value} method="get">
                <input type="hidden" name="sort" value={sort || ""} />
                <Button
                  type="submit"
                  name="type"
                  value={value}
                  className="hidden md:flex"
                  variant={type === value ? "primary" : "outline"}
                  leftIcon={<SpotIcon type={value} className="sq-4" />}
                >
                  {label}
                </Button>
                <IconButton
                  aria-label={`Filter ${label}`}
                  icon={<SpotIcon type={value} className="sq-4" />}
                  type="submit"
                  name="type"
                  className="flex md:hidden"
                  value={value}
                  variant={type === value ? "primary" : "outline"}
                />
              </form>
            ))}
          </div>

          <div>
            <SpotSort />
          </div>
        </div>
      </div>
      <div>
        <div className="space-y-10 pb-20">
          {spots.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 p-10">
              <p className="text-xl">No spots yet</p>
              {type && (
                <form>
                  <Button type="submit" variant="outline">
                    Clear filter
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:grid-cols-2">
              {spots.map((spot) => (
                <SpotItem key={spot.id} spot={spot} />
              ))}
            </div>
          )}
          <AppCta message="Download the app to see more spots" />
        </div>
      </div>
    </PageContainer>
  )
}
