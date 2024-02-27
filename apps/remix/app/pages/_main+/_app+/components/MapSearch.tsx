import * as React from "react"
import useOnClickOutside from "use-onclickoutside"

import { useFetcher } from "~/components/Form"
import { Button, Input, Spinner } from "~/components/ui"
import { type locationSearchLoader } from "~/pages/api+/mapbox+/location-search"

export function MapSearch({ onSearch }: { onSearch: (center: [number, number]) => void }) {
  const [search, setSearch] = React.useState("")
  const locationFetcher = useFetcher<typeof locationSearchLoader>()
  const ref = React.useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setSearch(""))

  const onStartPointQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearch(query)
    if (query.length < 1) return
    locationFetcher.load(`/api/mapbox/location-search?search=${query}`)
  }

  return (
    <>
      <div ref={ref} className="absolute left-2 top-2 space-y-2 md:left-4 md:top-4">
        <div className="bg-background rounded-xs w-[220px] overflow-hidden shadow-lg md:w-[250px]">
          <Input placeholder="Search location" value={search} onChange={onStartPointQuery} />
        </div>
        {search && (
          <div className="bg-background rounded-xs w-[calc(100vw-theme(spacing.4))] space-y-2 border p-2 shadow-lg md:w-full md:max-w-xl">
            {locationFetcher.state === "loading" && !locationFetcher.data ? (
              <Spinner />
            ) : !locationFetcher.data || locationFetcher.data.length === 0 ? (
              <p className="p-4 opacity-70">No results found</p>
            ) : (
              <>
                {locationFetcher.data.map((location) => (
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
