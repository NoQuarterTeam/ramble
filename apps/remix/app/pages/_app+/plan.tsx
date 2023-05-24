import * as React from "react"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useFetcher } from "@remix-run/react"
import { CircleDot, MapPin } from "lucide-react"
import useOnClickOutside from "use-onclickoutside"

import { useDisclosure } from "@ramble/shared"
import { Button, Input } from "@ramble/ui"

import { PageContainer } from "../../components/PageContainer"
import type { locationSearchLoader } from "../api+/location-search"
// import { Autocomplete } from "./components/Autocomplete"

export const loader = async ({ request }: LoaderArgs) => {
  return json(null)
}

export const action = async ({ request }: ActionArgs) => {
  //
}

export default function PlanTrip() {
  const [startingPointQuery, setStartingPointQuery] = React.useState("")
  const startingPointMenu = useDisclosure()
  const startingPointFetcher = useFetcher<typeof locationSearchLoader>()
  const startMenuRef = React.useRef<HTMLDivElement>(null)
  useOnClickOutside(startMenuRef, startingPointMenu.onClose)

  const onStartPointQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setStartingPointQuery(query)
    if (query.length < 1) return
    startingPointFetcher.load(`/api/location-search?search=${query}`)
  }

  const [destinationQuery, setDestinationQuery] = React.useState("")
  const destinationMenu = useDisclosure()
  const destinationFetcher = useFetcher<typeof locationSearchLoader>()

  const destinationMenuRef = React.useRef<HTMLDivElement>(null)
  useOnClickOutside(destinationMenuRef, destinationMenu.onClose)
  const onDestinationQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setDestinationQuery(query)
    if (query.length < 1) return
    destinationFetcher.load(`/api/location-search?search=${query}`)
  }

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
                {!startingPointFetcher.data ? (
                  <p className="p-4 opacity-70">Search for a place to start your trip</p>
                ) : startingPointFetcher.data.length === 0 ? (
                  <p className="p-4 opacity-70">No results found</p>
                ) : (
                  <div>
                    {startingPointFetcher.data.map((location, i) => (
                      <Button
                        onClick={() => {
                          setStartingPointQuery(location.name)
                          startingPointMenu.onClose()
                        }}
                        key={i}
                        variant="ghost"
                        className="h-auto w-full justify-start py-2 text-left"
                      >
                        <div>
                          <p>{location.name}</p>
                          <span className="text-sm opacity-70">{location.label}</span>
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
                {!destinationFetcher.data ? (
                  <p className="p-4 opacity-70">Search for a destination</p>
                ) : destinationFetcher.data.length === 0 ? (
                  <p className="p-4 opacity-70">No results found</p>
                ) : (
                  <div>
                    {destinationFetcher.data.map((location, i) => (
                      <Button
                        onClick={() => {
                          setDestinationQuery(location.name)
                          destinationMenu.onClose()
                        }}
                        key={i}
                        variant="ghost"
                        className="h-auto w-full justify-start py-2 text-left"
                      >
                        <div>
                          <p>{location.name}</p>
                          <span className="text-sm opacity-70">{location.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {startingPointQuery && destinationQuery && <Button>Go</Button>}
      </div>
    </PageContainer>
  )
}
