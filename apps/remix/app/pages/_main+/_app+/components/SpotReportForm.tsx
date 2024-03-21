import * as React from "react"
import type { ViewStateChangeEvent } from "react-map-gl"

import { useFetcher, useLocation, useNavigate, useSearchParams } from "@remix-run/react"
import turfCenter from "@turf/center"
import * as turf from "@turf/helpers"
import { CircleDot, Flag, X } from "lucide-react"
import queryString from "query-string"

import type { Spot, SpotAmenities, SpotImage, SpotType } from "@ramble/database/types"
import {
  AMENITIES,
  INITIAL_LATITUDE,
  INITIAL_LONGITUDE,
  SPOT_TYPE_OPTIONS,
  createS3Url,
  doesSpotTypeRequireAmenities,
  merge,
} from "@ramble/shared"

import { AmenitySelector } from "~/components/AmenitySelector"
import { Form, FormButton, FormError, FormField, FormFieldLabel } from "~/components/Form"
import { SpotIcon } from "~/components/SpotIcon"
import { Button, CloseButton, IconButton, Spinner, Textarea } from "~/components/ui"
import { AMENITIES_ICONS } from "~/lib/models/amenities"

import { MapView } from "~/components/Map"
import type { SerializeFrom } from "~/lib/vendor/vercel.server"
import type { geocodeLoader } from "~/pages/api+/mapbox+/geocode"

export function SpotReportForm({
  spot,
}: {
  spot: SerializeFrom<Spot & { images: SpotImage[]; amenities?: SpotAmenities | null }>
}) {
  // const ipInfo = useRouteLoaderData("pages/_app") as IpInfo
  // const errors = useFormErrors<typeof spotRevisionSchema>()
  const [searchParams] = useSearchParams()

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow
  const initialViewState = React.useMemo(() => {
    const zoom = searchParams.get("zoom")
    const minLat = searchParams.get("minLat")
    const maxLat = searchParams.get("maxLat")
    const minLng = searchParams.get("minLng")
    const maxLng = searchParams.get("maxLng")
    let centerFromParams: turf.Feature<turf.Point> | undefined
    if (minLat && maxLat && minLng && maxLng) {
      centerFromParams = turfCenter(
        turf.points([
          [Number.parseFloat(minLng), Number.parseFloat(minLat)],
          [Number.parseFloat(maxLng), Number.parseFloat(maxLat)],
        ]),
      )
    }
    return {
      zoom: zoom ? Number.parseInt(zoom) : 5,
      longitude: spot.longitude || centerFromParams?.geometry.coordinates[0] || INITIAL_LONGITUDE,
      latitude: spot.latitude || centerFromParams?.geometry.coordinates[1] || INITIAL_LATITUDE,
      // longitude: spot.longitude || centerFromParams?.geometry.coordinates[0] || ipInfo?.longitude || INITIAL_LONGITUDE,
      // latitude: spot.latitude || centerFromParams?.geometry.coordinates[1] || ipInfo?.latitude || INITIAL_LATITUDE,
    }
  }, [])

  const [latitude, setLatitude] = React.useState<number | null>(spot.latitude || initialViewState.latitude)
  const [longitude, setLongitude] = React.useState<number | null>(spot.longitude || initialViewState.longitude)
  const [type, setType] = React.useState<SpotType | null>(spot.type || null)

  const location = useLocation()
  const geocodeFetcher = useFetcher<typeof geocodeLoader>()

  const onMove = (e: mapboxgl.MapboxEvent<undefined> | ViewStateChangeEvent) => {
    const center = e.target.getCenter()
    setLatitude(center.lat)
    setLongitude(center.lng)
    const bounds = e.target.getBounds()
    const zoom = e.target.getZoom()
    const params = queryString.stringify(
      { minLat: bounds.getSouth(), maxLat: bounds.getNorth(), minLng: bounds.getWest(), maxLng: bounds.getEast(), zoom },
      { arrayFormat: "bracket" },
    )
    window.history.replaceState(null, "", `${location.pathname}?${params}`)
    geocodeFetcher.load(`/api/mapbox/geocode?${queryString.stringify({ latitude: center.lat, longitude: center.lng })}`)
  }

  const address = geocodeFetcher.data

  const navigate = useNavigate()

  const [flaggedImageIds, setFlaggedImageIds] = React.useState<string[]>([])
  const [incorrectLocation, setIncorrectLocation] = React.useState(false)
  const [isLocationUnknown, setIsLocationUnknown] = React.useState(false)

  const isFlagged = (id: string) => {
    return !!flaggedImageIds.find((imageId) => imageId === id)
  }
  const handleClickImage = (id: string) => {
    if (isFlagged(id)) {
      const newIds = flaggedImageIds.filter((imageId) => imageId !== id)
      setFlaggedImageIds(newIds)
    } else {
      setFlaggedImageIds([id, ...flaggedImageIds])
    }
  }

  // const user = useMaybeUser()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <Form className="relative h-auto space-y-4 overflow-scroll p-4 pb-40 md:h-nav-screen md:p-6 md:pb-60">
        <div>
          <div className="flex justify-between">
            <h1 className="text-3xl">Report incorrect data</h1>
            <CloseButton onClick={() => navigate(-1)} />
          </div>
          <p className="opacity-70">Edit the below information to let us know what you think is correct</p>
        </div>
        <input type="hidden" name="latitude" value={latitude || ""} />
        <input type="hidden" name="longitude" value={longitude || ""} />
        {flaggedImageIds.map((id) => (
          <input key={id} type="hidden" name="flaggedImageId" value={id} />
        ))}
        <div className="space-y-2">
          <FormField name="name" label="Name" defaultValue={spot.name} />
          <FormField name="description" label="Description" defaultValue={spot.description || ""} input={<Textarea rows={3} />} />

          {incorrectLocation ? (
            <div className="relative">
              <IconButton
                size="xs"
                variant="ghost"
                aria-label="back"
                className="absolute right-0 z-10"
                icon={<X className="sq-4" />}
                onClick={() => setIncorrectLocation(false)}
              />
              <div className="grid grid-cols-1 gap-2 pt-2 xl:grid-cols-2">
                <div className="opacity-70">
                  <FormFieldLabel name="address">Corrected address - move map to set</FormFieldLabel>
                  <div className="relative">
                    <FormField
                      className="dark:hover:border-gray-700 hover:border-gray-200"
                      // disabled
                      readOnly
                      name="address"
                      value={address || ""}
                    />
                    {geocodeFetcher.state === "loading" && <Spinner size="xs" className="-left-5 absolute top-2" />}
                  </div>
                </div>
                <FormField name="customAddress" defaultValue={spot.address || ""} label="Or write a custom address" />
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <FormFieldLabel name="address">Is the location incorrect?</FormFieldLabel>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIncorrectLocation(true)
                    setIsLocationUnknown(false)
                  }}
                >
                  Yes, and I know the correct location
                </Button>
                <p className="h-[intrinsic]">or</p>
                <Button
                  variant={isLocationUnknown ? "primary" : "outline"}
                  onClick={() => setIsLocationUnknown(!isLocationUnknown)}
                >
                  Yes, but I don't know where it is
                </Button>
              </div>
              <input type="hidden" name="isLocationUnknown" value={isLocationUnknown.toString()} />
            </div>
          )}

          <div className="space-y-0.5">
            <FormFieldLabel required>Type</FormFieldLabel>
            <input type="hidden" name="type" value={type || ""} />
            <div className="flex flex-wrap gap-1">
              {SPOT_TYPE_OPTIONS.filter((s) => !s.isComingSoon).map((spotType) => (
                <Button
                  key={spotType.value}
                  variant={type === spotType.value ? "primary" : "outline"}
                  type="button"
                  size="lg"
                  leftIcon={<SpotIcon type={spotType.value} className="sq-4" />}
                  onClick={() => setType(spotType.value)}
                >
                  {spotType.label}
                </Button>
              ))}
              {/* {errors?.fieldErrors?.type && (
                <ul id="type-error">
                  {errors?.fieldErrors?.type?.map((error, i) => <FormFieldError key={i}>{error}</FormFieldError>)}
                </ul>
              )} */}
            </div>
            <p className="py-2 text-sm opacity-80">More options coming soon!</p>
          </div>
          {doesSpotTypeRequireAmenities(type) && (
            <div className="space-y-0.5">
              <FormFieldLabel>Amenities</FormFieldLabel>
              <div className="flex flex-wrap gap-1">
                {Object.entries(AMENITIES).map(([key, label]) => (
                  <AmenitySelector
                    key={key}
                    Icon={AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]}
                    label={label}
                    value={key}
                    defaultIsSelected={(spot.amenities?.[key as keyof Omit<typeof spot.amenities, "id">] as boolean) || false}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1">
            <div>
              <FormFieldLabel>Images</FormFieldLabel>
              <p className="text-sm opacity-80">Flag any images that are incorrect or innappropriate</p>
            </div>

            {spot.images.map(({ id, path }) => {
              return (
                <div key={path} className="relative">
                  <div className="absolute top-2 left-2 z-10">
                    <Button
                      onClick={() => handleClickImage(id)}
                      variant={isFlagged(id) ? "destructive" : "secondary"}
                      leftIcon={<Flag className="sq-4" />}
                    >
                      {isFlagged(id) ? "Flagged" : "Flag"}
                    </Button>
                  </div>
                  <img
                    src={createS3Url(path)}
                    className={merge(
                      "h-[300px] w-full overflow-hidden rounded object-cover hover:opacity-80",
                      isFlagged(id) && "opacity-80 outline outline-red-500 outline-solid",
                    )}
                    alt="spot cover"
                  />
                </div>
              )
            })}
          </div>

          <FormError />
        </div>
        <div className="fixed bottom-0 left-0 z-10 w-full space-x-4 border-t bg-background px-6 py-4 md:w-1/2">
          <div className="flex-col">
            <div>
              <FormField required name="notes" label="Notes" input={<Textarea rows={3} />} />
              <p className="py-2 text-sm opacity-80">Tell us more about what was wrong</p>
            </div>
            <div className="flex justify-end">
              <FormButton size="lg">Submit report</FormButton>
            </div>
          </div>
        </div>
      </Form>

      <div className="relative h-nav-screen w-full">
        <MapView
          onLoad={onMove}
          onMoveEnd={onMove}
          doubleClickZoom={true}
          scrollZoom={false}
          initialViewState={initialViewState}
        />

        <CircleDot className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2" />
      </div>
    </div>
  )
}
