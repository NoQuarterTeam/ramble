import * as React from "react"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useFetcher } from "@remix-run/react"
import bbox from "@turf/bbox"
import * as turf from "@turf/helpers"
import { CircleDot, MapPin } from "lucide-react"
import useOnClickOutside from "use-onclickoutside"

import { useDisclosure } from "@ramble/shared"
import { Button, Input, Spinner } from "@ramble/ui"

import { PageContainer } from "../../components/PageContainer"
import type { locationSearchLoader } from "../api+/mapbox+/location-search"

import type { LngLatLike, MapRef } from "react-map-gl"
import { Map, Marker } from "react-map-gl"
import { useTheme } from "~/lib/theme"
// import { Autocomplete } from "./components/Autocomplete"

export const loader = async ({ request }: LoaderArgs) => {
  return json(null)
}

export const action = async ({ request }: ActionArgs) => {
  //
}

export default function PlanTrip() {
  const theme = useTheme()
  const [startCoords, setStartCoords] = React.useState<[number, number] | null>(null)
  const [endCoords, setEndCoords] = React.useState<[number, number] | null>(null)

  const [startingPointQuery, setStartingPointQuery] = React.useState("")
  const startingPointMenu = useDisclosure()
  const startingPointFetcher = useFetcher<typeof locationSearchLoader>()
  const startMenuRef = React.useRef<HTMLDivElement>(null)
  useOnClickOutside(startMenuRef, startingPointMenu.onClose)

  const onStartPointQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setStartingPointQuery(query)
    if (query.length < 1) return
    startingPointFetcher.load(`/api/mapbox/location-search?search=${query}`)
  }
  const mapRef = React.useRef<MapRef>(null)

  const [destinationQuery, setDestinationQuery] = React.useState("")
  const destinationMenu = useDisclosure()
  const destinationFetcher = useFetcher<typeof locationSearchLoader>()

  const destinationMenuRef = React.useRef<HTMLDivElement>(null)
  useOnClickOutside(destinationMenuRef, destinationMenu.onClose)
  const onDestinationQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setDestinationQuery(query)
    if (query.length < 1) return
    destinationFetcher.load(`/api/mapbox/location-search?search=${query}`)
  }

  const directionsFetcher = useFetcher()

  React.useEffect(() => {
    if (startCoords && !endCoords) {
      mapRef.current?.flyTo({ center: startCoords, duration: 1000, padding: 50 })
    } else if (endCoords && !startCoords) {
      mapRef.current?.flyTo({ center: endCoords, duration: 1000, padding: 50 })
    } else if (startCoords && endCoords) {
      const line = turf.lineString([startCoords, endCoords])
      const bounds = bbox(line) as unknown as LngLatLike
      mapRef.current?.fitBounds(bounds, { padding: 50 })
      directionsFetcher.load(
        `/api/mapbox/directions?startLng=${startCoords[0]}&startLat=${startCoords[1]}&endLng=${endCoords[0]}&endLat=${endCoords[1]}&`,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCoords, endCoords])

  return (
    <PageContainer>
      <div>
        <h1 className="text-3xl">Plan a trip</h1>
        <p>We'll help you find spots and suggest things to do along the way!</p>
      </div>
      <div className="space-y-2">
        <div ref={startMenuRef} className="flex items-center space-x-2">
          <CircleDot />
          <div className="relative w-full">
            <Input
              onFocus={startingPointMenu.onOpen}
              placeholder="Starting point"
              value={startingPointQuery}
              size="lg"
              onChange={onStartPointQuery}
            />
            {startingPointQuery && startingPointMenu.isOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border border-gray-100 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                {startingPointFetcher.state === "loading" ? (
                  <Spinner />
                ) : !startingPointFetcher.data ? (
                  <p className="p-4 opacity-70">Search for a place to start your trip</p>
                ) : startingPointFetcher.data.length === 0 ? (
                  <p className="p-4 opacity-70">No results found</p>
                ) : (
                  <div>
                    {startingPointFetcher.data.map((location, i) => (
                      <Button
                        onClick={() => {
                          setStartingPointQuery(location.name)
                          setStartCoords(location.center)
                          startingPointMenu.onClose()
                        }}
                        key={i}
                        variant="ghost"
                        className="h-auto w-full justify-start py-2 text-left"
                      >
                        <div>
                          <p>{location.name}</p>
                          <span className="text-sm opacity-70">{location.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div ref={destinationMenuRef} className="flex items-center space-x-2">
          <MapPin />
          <div className="relative w-full">
            <Input
              onFocus={destinationMenu.onOpen}
              placeholder="Destination"
              value={destinationQuery}
              size="lg"
              onChange={onDestinationQuery}
            />
            {destinationQuery && destinationMenu.isOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border border-gray-100 bg-white p-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                {destinationFetcher.state === "loading" ? (
                  <Spinner />
                ) : !destinationFetcher.data ? (
                  <p className="p-4 opacity-70">Search for a destination</p>
                ) : destinationFetcher.data.length === 0 ? (
                  <p className="p-4 opacity-70">No results found</p>
                ) : (
                  <div>
                    {destinationFetcher.data.map((location, i) => (
                      <Button
                        onClick={() => {
                          setDestinationQuery(location.name)
                          setEndCoords(location.center)
                          destinationMenu.onClose()
                        }}
                        key={i}
                        variant="ghost"
                        className="h-auto w-full justify-start py-2 text-left"
                      >
                        <div>
                          <p>{location.name}</p>
                          <span className="text-sm opacity-70">{location.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="relative h-[500px] w-full">
          <Map
            mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
            // onLoad={onMove}
            // onMoveEnd={onMove}
            ref={mapRef}
            style={{ height: "100%", width: "100%" }}
            // initialViewState={initialViewState}
            attributionControl={false}
            mapStyle={
              theme === "dark"
                ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1"
                : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
            }
          >
            {startCoords && (
              <Marker longitude={startCoords[0]} latitude={startCoords[1]}>
                <div className="sq-5 flex items-center  justify-center rounded-full bg-green-500">
                  <p>A</p>
                </div>
              </Marker>
            )}
            {endCoords && (
              <Marker longitude={endCoords[0]} latitude={endCoords[1]}>
                <div className="sq-5 flex items-center  justify-center rounded-full bg-green-500">
                  <p>B</p>
                </div>
              </Marker>
            )}
          </Map>
        </div>
      </div>
    </PageContainer>
  )
}
