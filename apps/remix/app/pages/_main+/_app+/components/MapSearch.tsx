import * as React from "react"

import { useFetcher } from "~/components/Form"

import { Button, Input, Spinner } from "~/components/ui"
import { locationSearchLoader } from "~/pages/api+/mapbox+/location-search"
import useOnClickOutside from "use-onclickoutside"
import { MapRef } from "react-map-gl"

export function MapSearch({ mapRef }: { mapRef: React.RefObject<MapRef> }) {
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
      <div ref={ref} className="absolute left-4 top-4 space-y-2">
        <div className="bg-background w-[250px] shadow-lg">
          <Input placeholder="Search location" value={search} onChange={onStartPointQuery} />
        </div>
        {search && (
          <div className="bg-background rounded-xs w-full max-w-xl space-y-2 border p-2 shadow-lg">
            {locationFetcher.state === "loading" && !locationFetcher.data ? (
              <Spinner />
            ) : !locationFetcher.data || locationFetcher.data.length === 0 ? (
              <p className="p-4 opacity-70">No results found</p>
            ) : (
              <>
                {locationFetcher.data.map((location, i) => (
                  <Button
                    onClick={() => {
                      mapRef.current?.flyTo({ center: location.center })
                      setSearch("")
                    }}
                    key={i}
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
