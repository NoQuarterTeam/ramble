import * as React from "react"
import type { ViewStateChangeEvent } from "react-map-gl"
import { useFetcher, useLocation, useNavigate, useSearchParams } from "@remix-run/react"
import turfCenter from "@turf/center"
import * as turf from "@turf/helpers"
import { CircleDot, Lock, Plus } from "lucide-react"
import queryString from "query-string"

import type { Spot, SpotAmenities, SpotImage } from "@ramble/database/types"
import { type SpotType } from "@ramble/database/types"
import { type spotSchema } from "@ramble/server-schemas"
import {
  AMENITIES,
  doesSpotTypeRequireAmenities,
  doesSpotTypeRequireDescription,
  INITIAL_LATITUDE,
  INITIAL_LONGITUDE,
  SPOT_TYPE_OPTIONS,
} from "@ramble/shared"

import { AmenitySelector } from "~/components/AmenitySelector"
import { Form, FormButton, FormError, FormField, FormFieldError, FormFieldLabel, ImageField } from "~/components/Form"
import { ImageUploader } from "~/components/ImageUploader"
import { Map } from "~/components/Map"
import { SpotIcon } from "~/components/SpotIcon"
import { Button, Checkbox, CloseButton, IconButton, Spinner, Textarea, Tooltip } from "~/components/ui"
import { useFormErrors } from "~/lib/form"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { AMENITIES_ICONS } from "~/lib/models/amenities"
import type { SerializeFrom } from "~/lib/vendor/vercel.server"
import type { geocodeLoader } from "~/pages/api+/mapbox+/geocode"

export function SpotForm({ spot }: { spot?: SerializeFrom<Spot & { images: SpotImage[]; amenities?: SpotAmenities | null }> }) {
  // const ipInfo = useRouteLoaderData("pages/_app") as IpInfo
  const errors = useFormErrors<typeof spotSchema>()
  const [searchParams] = useSearchParams()
  const initialViewState = React.useMemo(() => {
    const zoom = searchParams.get("zoom")
    const minLat = searchParams.get("minLat")
    const maxLat = searchParams.get("maxLat")
    const minLng = searchParams.get("minLng")
    const maxLng = searchParams.get("maxLng")
    let centerFromParams
    if (minLat && maxLat && minLng && maxLng) {
      centerFromParams = turfCenter(
        turf.points([
          [parseFloat(minLng), parseFloat(minLat)],
          [parseFloat(maxLng), parseFloat(maxLat)],
        ]),
      )
    }
    return {
      zoom: zoom ? parseInt(zoom) : 5,
      longitude: spot?.longitude || centerFromParams?.geometry.coordinates[0] || INITIAL_LONGITUDE,
      latitude: spot?.latitude || centerFromParams?.geometry.coordinates[1] || INITIAL_LATITUDE,
      // longitude: spot?.longitude || centerFromParams?.geometry.coordinates[0] || ipInfo?.longitude || INITIAL_LONGITUDE,
      // latitude: spot?.latitude || centerFromParams?.geometry.coordinates[1] || ipInfo?.latitude || INITIAL_LATITUDE,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [latitude, setLatitude] = React.useState<number | null>(spot?.latitude || initialViewState.latitude)
  const [longitude, setLongitude] = React.useState<number | null>(spot?.longitude || initialViewState.longitude)
  const [type, setType] = React.useState<SpotType | null>(spot?.type || null)

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

  const [images, setImages] = React.useState<Pick<SpotImage, "path">[]>(spot?.images || [])

  const user = useMaybeUser()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <Form className="md:h-nav-screen relative h-auto space-y-4 overflow-scroll p-4 pb-40 md:p-6 md:pb-40">
        <div>
          <div className="flex justify-between">
            <h1 className="text-3xl">{spot ? "Edit spot" : "Add a new spot"}</h1>
            <CloseButton onClick={() => navigate(-1)} />
          </div>
          {user?.role === "MEMBER" && <p className="opacity-70">A Guide will verify it after</p>}
        </div>
        <input type="hidden" name="latitude" value={latitude || ""} />
        <input type="hidden" name="longitude" value={longitude || ""} />
        <div className="space-y-2">
          <FormField required name="name" label="Name" defaultValue={spot?.name} />
          <FormField
            required={doesSpotTypeRequireDescription(type)}
            name="description"
            label="Description"
            defaultValue={spot?.description || ""}
            input={<Textarea rows={3} />}
          />

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="opacity-70">
              <FormFieldLabel name="address">Address - move map to set</FormFieldLabel>
              <div className="relative">
                <FormField
                  className="hover:border-gray-200 dark:hover:border-gray-700"
                  // disabled
                  readOnly
                  name="address"
                  value={address || ""}
                />
                {geocodeFetcher.state === "loading" && <Spinner size="xs" className="absolute -left-5 top-2" />}
              </div>
            </div>
            <FormField name="customAddress" defaultValue={spot?.address || ""} label="Or write a custom address" />
          </div>

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
              {errors?.fieldErrors?.type && (
                <ul id="type-error">
                  {errors?.fieldErrors?.type?.map((error, i) => <FormFieldError key={i}>{error}</FormFieldError>)}
                </ul>
              )}
            </div>
            <p className="py-2 text-sm opacity-80">More options coming soon!</p>
          </div>
          {doesSpotTypeRequireAmenities(type) && (
            <div className="space-y-0.5">
              <FormFieldLabel required>Amenities</FormFieldLabel>
              <div className="flex flex-wrap gap-1">
                {Object.entries(AMENITIES).map(([key, label]) => (
                  <AmenitySelector
                    key={key}
                    Icon={AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]}
                    label={label}
                    value={key}
                    defaultIsSelected={(spot?.amenities?.[key as keyof Omit<typeof spot.amenities, "id">] as boolean) || false}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="space-y-0.5">
            <FormFieldLabel required>Images</FormFieldLabel>

            {images.map(({ path }) => (
              <ImageField
                className="h-[300px] overflow-hidden rounded"
                errors={[]}
                onRemove={() => setImages(images.filter((image) => image.path !== path))}
                defaultValue={path}
                key={path}
                name="image"
              />
            ))}

            <ImageUploader isMulti onMultiSubmit={(keys) => setImages((i) => [...i, ...keys.map((k) => ({ path: k }))])}>
              <IconButton variant="outline" icon={<Plus className="sq-4" />} aria-label="Add image" />
            </ImageUploader>
          </div>

          <FormError />
        </div>
        <div className="bg-background fixed bottom-0 left-0 z-10 flex w-full justify-end space-x-4 border-t px-6 py-4 md:w-1/2">
          {!spot && (
            <Tooltip label="The spot will be made public in 2 weeks">
              <label htmlFor="shouldPublishLater" className="hstack">
                <Lock size={16} />
                <p>Publish later</p>
                <Checkbox id="shouldPublishLater" name="shouldPublishLater" />
              </label>
            </Tooltip>
          )}
          <FormButton disabled={!address} size="lg">
            Save
          </FormButton>
        </div>
      </Form>

      <div className="h-nav-screen relative w-full">
        <Map onLoad={onMove} onMoveEnd={onMove} doubleClickZoom={true} scrollZoom={false} initialViewState={initialViewState} />

        <CircleDot className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  )
}
