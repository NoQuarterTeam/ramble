import * as React from "react"
import type { LngLatLike, MapRef } from "react-map-gl"
import { Layer, Map, Marker, Source } from "react-map-gl"
import { useFetcher } from "@remix-run/react"
import bbox from "@turf/bbox"
import * as turf from "@turf/helpers"
import { type SerializeFrom } from "@vercel/remix"
import { CircleDot, MapPin } from "lucide-react"
import useOnClickOutside from "use-onclickoutside"

import { INITIAL_LATITUDE, INITIAL_LONGITUDE, useDisclosure } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Button, Input, Spinner } from "~/components/ui"
import { SPOTS } from "~/lib/static/spots"
import { useTheme } from "~/lib/theme"

import { PageContainer } from "../../../components/PageContainer"
import type { directionsLoader } from "../../api+/mapbox+/directions"
import type { locationSearchLoader } from "../../api+/mapbox+/location-search"

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

  const directionsFetcher = useFetcher<typeof directionsLoader>()
  const directions = directionsFetcher.data?.directions
  const spots = directionsFetcher?.data?.foundSpots
  React.useEffect(() => {
    if (startCoords && !endCoords) {
      mapRef.current?.flyTo({ center: startCoords, duration: 1000, padding: 50 })
    } else if (endCoords && !startCoords) {
      mapRef.current?.flyTo({ center: endCoords, duration: 1000, padding: 50 })
    } else if (startCoords && endCoords) {
      const line = turf.lineString([startCoords, endCoords])
      const bounds = bbox(line) as unknown as LngLatLike
      mapRef.current?.fitBounds(bounds, { padding: 100 })
      directionsFetcher.load(
        `/api/mapbox/directions?startLng=${startCoords[0]}&startLat=${startCoords[1]}&endLng=${endCoords[0]}&endLat=${endCoords[1]}&`,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCoords, endCoords])

  const markers = React.useMemo(
    () =>
      spots?.map((spot, i) => (
        <SpotMarker
          spot={spot}
          key={i}
          onClick={(e) => {
            // e.originalEvent.stopPropagation()
            // if (!point.properties.cluster && point.properties.id) {
            //   navigate(`/map/${point.properties.id}${window.location.search}`)
            // }
            // const center = point.geometry.coordinates as LngLatLike
            // const currentZoom = mapRef.current?.getZoom()
            // const zoom = point.properties.cluster ? Math.min((currentZoom || 5) + 2, 14) : currentZoom
            // mapRef.current?.flyTo({
            //   center,
            //   duration: 1000,
            //   padding: 50,
            //   zoom,
            //   offset: point.properties.cluster ? [0, 0] : [250, 0],
            // })
          }}
        />
      )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spots],
  )

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
            initialViewState={{ latitude: INITIAL_LATITUDE, longitude: INITIAL_LONGITUDE, zoom: 3 }}
            attributionControl={false}
            mapStyle={
              theme === "dark"
                ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1"
                : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
            }
          >
            {directions && (
              <Source id="directions" type="geojson" data={directions.routes[0].geometry}>
                <Layer id="line" type="line" paint={{ "line-color": colors.blue[500], "line-width": 4 }} />
              </Source>
            )}
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
            {markers}
          </Map>
          {directionsFetcher.state === "loading" && (
            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
              <div className="sq-10 flex items-center justify-center rounded-md bg-white dark:bg-gray-700">
                <Spinner />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

interface MarkerProps {
  onClick: (e: mapboxgl.MapboxEvent<MouseEvent>) => void
  spot: SerializeFrom<typeof directionsLoader>["foundSpots"][number]
}
function SpotMarker(props: MarkerProps) {
  const Icon = SPOTS[props.spot.type].Icon
  return (
    <Marker onClick={props.onClick} anchor="bottom" longitude={props.spot.longitude} latitude={props.spot.latitude}>
      <div className="relative">
        <div className="sq-8 bg-primary-600 dark:bg-primary-700 border-primary-100 dark:border-primary-600 flex cursor-pointer items-center justify-center rounded-full border shadow-md transition-transform hover:scale-110">
          {Icon && <Icon className="sq-4 text-white" />}
        </div>
        <div className="sq-3 bg-primary-600 dark:bg-primary-700 absolute -bottom-[3px] left-1/2 -z-[1] -translate-x-1/2 rotate-45 shadow" />
      </div>
    </Marker>
  )
}
