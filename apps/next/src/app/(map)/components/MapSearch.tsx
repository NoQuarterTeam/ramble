import { api } from "@/lib/trpc/react"
import * as React from "react"
import useOnClickOutside from "use-onclickoutside"

import { Button, Input, Spinner } from "@/components/ui"

export function MapSearch({ onSearch }: { onSearch: (center: [number, number]) => void }) {
  const [search, setSearch] = React.useState("")
  const { data, isLoading } = api.mapbox.getPlaces.useQuery({ search }, { enabled: !!search, keepPreviousData: true })
  const ref = React.useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setSearch(""))

  const onStartPointQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearch(query)
    if (query.length < 1) return
  }

  return (
    <>
      <div ref={ref} className="absolute top-2 left-2 space-y-2 md:top-4 md:left-4">
        <div className="w-[220px] overflow-hidden rounded-xs bg-background shadow-lg md:w-[250px]">
          <Input placeholder="Search location" value={search} onChange={onStartPointQuery} />
        </div>
        {search && (
          <div className="w-[calc(100vw-theme(spacing.4))] space-y-2 rounded-xs border bg-background p-2 shadow-lg md:w-full md:max-w-xl">
            {isLoading ? (
              <Spinner />
            ) : !data || data.length === 0 ? (
              <p className="p-4 opacity-70">No results found</p>
            ) : (
              <>
                {data.map((location) => (
                  <Button
                    onClick={() => {
                      onSearch(location.center)
                      setSearch("")
                    }}
                    key={location.name}
                    variant="ghost"
                    className="h-auto w-full justify-start py-2 text-left"
                  >
                    <p className="truncate">{location.name}</p>
                  </Button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
