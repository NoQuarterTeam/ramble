import * as React from "react"
import type { ViewStateChangeEvent } from "react-map-gl"
import Map from "react-map-gl"
import { useFetcher, useNavigate, useRouteLoaderData, useSearchParams } from "@remix-run/react"
import turfCenter from "@turf/center"
import * as turf from "@turf/helpers"
import type { SerializeFrom } from "@vercel/remix"
// import { redirect } from "@vercel/remix"
import { CircleDot, Plus } from "lucide-react"
import queryString from "query-string"
import { z } from "zod"

import type { Spot, SpotImage } from "@ramble/database/types"
import { SpotType } from "@ramble/database/types"
import { INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"
import { Button, CloseButton, IconButton, Spinner, Textarea } from "@ramble/ui"

import { Form, FormButton, FormError, FormField, FormFieldError, FormFieldLabel, ImageField } from "~/components/Form"
import { ImageUploader } from "~/components/ImageUploader"
import { FormNumber, NullableFormString, useFormErrors } from "~/lib/form"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { SPOT_OPTIONS } from "~/lib/spots"
import { useTheme } from "~/lib/theme"
import type { geocodeLoader } from "~/pages/api+/geocode"

import type { IpInfo } from "../_layout"

export const spotSchema = z.object({
  latitude: FormNumber,
  longitude: FormNumber,
  name: z.string().min(2),
  address: z.string().min(2),
  customAddress: NullableFormString,
  type: z.nativeEnum(SpotType),
  description: z.string().min(50),
})

export function SpotForm({ spot }: { spot?: SerializeFrom<Spot & { images: SpotImage[] }> }) {
  const ipInfo = useRouteLoaderData("pages/_app") as IpInfo
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
      zoom: zoom ? parseInt(zoom) : ipInfo ? 6 : 5,
      longitude: centerFromParams?.geometry.coordinates[0] || ipInfo?.longitude || INITIAL_LONGITUDE,
      latitude: centerFromParams?.geometry.coordinates[1] || ipInfo?.latitude || INITIAL_LATITUDE,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [latitude, setLatitude] = React.useState<number | null>(spot?.latitude || initialViewState.latitude)
  const [longitude, setLongitude] = React.useState<number | null>(spot?.longitude || initialViewState.longitude)
  const [type, setType] = React.useState<SpotType | null>(spot?.type || null)

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
    window.history.replaceState(null, "", `${window.location.pathname}?${params}`)
    geocodeFetcher.load(`/api/geocode?${queryString.stringify({ latitude: center.lat, longitude: center.lng })}`)
  }

  const address = geocodeFetcher.data

  const navigate = useNavigate()
  const theme = useTheme()
  const [images, setImages] = React.useState<Pick<SpotImage, "path">[]>(spot?.images || [])

  const user = useMaybeUser()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <Form method="post" replace className="md:h-nav-screen relative h-auto space-y-4 overflow-scroll p-4 pb-40 md:p-8 md:pb-40">
        <div>
          <div className="flex justify-between">
            <h1 className="text-3xl">{spot ? "Edit spot" : "Add a new spot"}</h1>
            <CloseButton onClick={() => navigate(-1)} />
          </div>
          {user && user.role === "USER" && <p className="opacity-70">An Ambassador will verify it shortly</p>}
        </div>
        <input type="hidden" name="latitude" value={latitude || ""} />
        <input type="hidden" name="longitude" value={longitude || ""} />
        <div className="space-y-2">
          <FormField required name="name" label="Name" defaultValue={spot?.name} />
          <FormField
            required
            name="description"
            label="Description"
            defaultValue={spot?.description}
            input={<Textarea rows={5} />}
          />

          <div>
            <FormFieldLabel name="address">Address</FormFieldLabel>
            <div className="relative">
              <FormField readOnly name="address" value={address || ""} />
              {geocodeFetcher.state === "loading" && <Spinner size="xs" className="absolute -left-5 top-2" />}
            </div>
          </div>
          <FormField name="customAddress" defaultValue={spot?.address} label="Write a custom address" />

          <div className="space-y-0.5">
            <FormFieldLabel required>Type</FormFieldLabel>
            <input type="hidden" name="type" value={type || ""} />
            <div className="flex flex-wrap gap-1">
              {SPOT_OPTIONS.map((spotType) => (
                <Button
                  key={spotType.value}
                  variant={type === spotType.value ? "primary" : "outline"}
                  type="button"
                  size="lg"
                  leftIcon={<spotType.Icon className="sq-4" />}
                  onClick={() => setType(spotType.value)}
                >
                  {spotType.label}
                </Button>
              ))}
              {errors?.fieldErrors?.type && (
                <ul id="type-error">
                  {errors?.fieldErrors?.type?.map((error, i) => (
                    <FormFieldError key={i}>{error}</FormFieldError>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="space-y-0.5">
            <FormFieldLabel required>Images</FormFieldLabel>

            {images.map(({ path }, i) => (
              <ImageField
                className="h-[300px] overflow-hidden rounded"
                errors={[]}
                onRemove={() => setImages(images.filter((image) => image.path !== path))}
                defaultValue={path}
                key={i}
                name="image"
              />
            ))}

            <ImageUploader onSubmit={(path) => setImages((i) => [...i, { path }])}>
              <IconButton variant="outline" icon={<Plus className="sq-4" />} aria-label="Add image" />
            </ImageUploader>
          </div>

          <FormError />
        </div>
        <div className="fixed bottom-0 left-0 flex w-full justify-end border-t border-gray-100 bg-white px-10 py-4 dark:border-gray-600 dark:bg-gray-800 md:w-1/2">
          <FormButton size="lg">Save</FormButton>
        </div>
      </Form>

      <div className="h-nav-screen relative w-full">
        <Map
          mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
          onLoad={onMove}
          onMoveEnd={onMove}
          // ref={mapRef}
          style={{ height: "100%", width: "100%" }}
          initialViewState={initialViewState}
          attributionControl={false}
          mapStyle={
            theme === "dark"
              ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1"
              : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
          }
        ></Map>
        <>
          <CircleDot className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </>
      </div>
    </div>
  )
}
