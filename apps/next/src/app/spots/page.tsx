import { AppCta } from "@/components/AppCta"
import { PageContainer } from "@/components/PageContainer"
import { SearchParamButton, SearchParamIconButton, SearchParamSelect } from "@/components/SearchParamInputs"
import { SpotIcon } from "@/components/SpotIcon"
import { SpotItem } from "@/components/SpotItem"
import { Button } from "@/components/ui"
import { db } from "@/lib/server/db"
import type { SpotType } from "@ramble/database/types"
import { spotListQuery } from "@ramble/server-services"
import { SPOT_TYPE_OPTIONS, type SpotItemType, type SpotListSort } from "@ramble/shared"

const TAKE = 24

type SearchParams = { type?: SpotType; sort?: SpotListSort }

const getSpots = ({ type, sort = "latest" }: SearchParams) =>
  db.$queryRaw<Array<SpotItemType>>`${spotListQuery({ type, sort, take: TAKE })}`

export const revalidate = 86400

const SORT_OPTIONS: { value: SpotListSort; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "rated", label: "Top rated" },
  { value: "saved", label: "Most saved" },
] as const

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const spots = await getSpots(searchParams)

  return (
    <PageContainer className="pt-0">
      <div className="sticky top-nav z-[1] bg-background py-4">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex gap-1">
            <SearchParamButton name="type" value="">
              All
            </SearchParamButton>

            {SPOT_TYPE_OPTIONS.filter((s) => s.category === "STAY" && !s.isComingSoon).map(({ value, label }) => (
              <div key={value}>
                <SearchParamButton
                  name="type"
                  value={value}
                  className="hidden md:flex"
                  leftIcon={<SpotIcon type={value} className="sq-4" />}
                >
                  {label}
                </SearchParamButton>
                <SearchParamIconButton
                  aria-label={`Filter ${label}`}
                  icon={<SpotIcon type={value} className="sq-4" />}
                  name="type"
                  className="flex md:hidden"
                  value={value}
                />
              </div>
            ))}
          </div>

          <div>
            <SearchParamSelect name="sort">
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SearchParamSelect>
          </div>
        </div>
      </div>
      <div>
        <div className="space-y-10 pb-20">
          {spots.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 p-10">
              <p className="text-xl">No spots yet</p>
              <form>
                <Button type="submit" variant="outline">
                  Clear filter
                </Button>
              </form>
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
