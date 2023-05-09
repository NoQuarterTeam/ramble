import { useFetcher, useNavigate, useRouteLoaderData, useSearchParams } from "@remix-run/react"
import { SpotType } from "@travel/database/types"
import { INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@travel/shared"
import { Button, CloseButton, IconButton, Spinner, Textarea } from "@travel/ui"

import turfCenter from "@turf/center"
import * as turf from "@turf/helpers"
import type { ActionArgs, LinksFunction } from "@vercel/remix"
import { redirect } from "@vercel/remix"
// import { redirect } from "@vercel/remix"
import { CircleDot, Plus } from "lucide-react"
import mapStyles from "mapbox-gl/dist/mapbox-gl.css"
import queryString from "query-string"
import * as React from "react"
import type { ViewStateChangeEvent } from "react-map-gl"
import Map from "react-map-gl"
import { z } from "zod"
import { Form, FormButton, FormError, FormField, FormFieldError, FormFieldLabel, ImageField } from "~/components/Form"
import { db } from "~/lib/db.server"
import { formError, FormNumber, NullableFormString, useFormErrors, validateFormData } from "~/lib/form"
import { SPOT_OPTIONS } from "~/lib/spots"
import { useTheme } from "~/lib/theme"
import { requireUser } from "~/services/auth/auth.server"
import type { geocodeLoader } from "../api+/geocode"
import type { IpInfo } from "./_layout"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: mapStyles }]
}

const schema = z.object({
  latitude: FormNumber,
  longitude: FormNumber,
  name: z.string().min(2),
  address: z.string().min(2),
  customAddress: NullableFormString,
  type: z.nativeEnum(SpotType),
  description: z.string().min(50),
})
export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUser(request)
  const formData = await request.formData()

  const result = await validateFormData(formData, schema)

  const images = (formData.getAll("image") as string[]).filter(Boolean)

  // if (images.length === 0) return formError({ formError: "You must upload at least one image." })
  if (!result.success) return formError(result)

  const { customAddress, ...data } = result.data
  const spot = await db.spot.create({
    data: {
      creator: { connect: { id: userId } },
      ...data,
      images: { create: images.map((image) => ({ path: image, creator: { connect: { id: userId } } })) },
      address: customAddress ?? data.address,
    },
  })

  return redirect(`/spots/${spot.id}`)
}

export default function NewSpot() {
  const ipInfo = useRouteLoaderData("pages/_app") as IpInfo
  const errors = useFormErrors<typeof schema>()
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

  const [latitude, setLatitude] = React.useState<number | null>(initialViewState.latitude)
  const [longitude, setLongitude] = React.useState<number | null>(initialViewState.longitude)
  const [type, setType] = React.useState<SpotType | null>(null)

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
    window.history.pushState(null, "", `${window.location.pathname}?${params}`)
    geocodeFetcher.load(`/api/geocode?${queryString.stringify({ latitude: center.lat, longitude: center.lng })}`)
  }

  const address = geocodeFetcher.data

  const navigate = useNavigate()
  const theme = useTheme()

  const [imageCount, setImageCount] = React.useState(1)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <Form
        method="post"
        replace
        className="relative h-[calc(100vh-70px)] space-y-4 overflow-scroll p-4 pb-40 pl-10 md:p-10 md:pb-40 md:pl-20"
      >
        <div className="flex justify-between">
          <h1 className="text-3xl">Add a new spot</h1>

          <CloseButton onClick={() => navigate(`/map${window.location.search}`)} />
        </div>
        <input type="hidden" name="latitude" value={latitude || ""} />
        <input type="hidden" name="longitude" value={longitude || ""} />
        <div className="space-y-2">
          <FormField required name="name" label="Name" />
          <FormField required name="description" label="Description" input={<Textarea rows={5} />} />

          <div>
            <FormFieldLabel name="address">Address</FormFieldLabel>
            <div className="relative">
              <FormField readOnly name="address" value={address} />
              {geocodeFetcher.state === "loading" && <Spinner size="xs" className="absolute -left-5 top-2" />}
            </div>
          </div>
          <FormField name="customAddress" label="Custom address" />

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
            {Array.from({ length: imageCount }).map((_, i) => (
              <ImageField errors={[]} key={i} path="spots/images" name="image" />
            ))}
            <IconButton
              variant="outline"
              icon={<Plus className="sq-4" />}
              aria-label="Add image"
              onClick={() => setImageCount((i) => i + 1)}
            />
          </div>

          <FormError />
        </div>
        <div className="fixed bottom-0 left-0 flex w-1/2 justify-end border-t border-gray-100 bg-white px-10 py-4 dark:border-gray-600 dark:bg-gray-800">
          <FormButton size="lg">Save</FormButton>
        </div>
      </Form>

      <div className="relative h-[calc(100vh-70px)] w-full">
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
