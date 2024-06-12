import * as Sentry from "@sentry/nextjs"
export async function geocodeCoords({ latitude, longitude }: { latitude: number; longitude: number }) {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
    )
    const jsonResponse = (await res.json()) as FeatureCollection
    const address = jsonResponse.features.find((feature) => feature.place_type.includes("address"))?.place_name
    const place = jsonResponse.features.find((feature) => feature.place_type.includes("place"))?.place_name
    const country = jsonResponse.features.find((feature) => feature.place_type.includes("country"))?.place_name
    return { address, place, country }
  } catch (error) {
    Sentry.captureException(error)
    return { address: undefined, place: undefined }
  }
}

export async function geocodeAddress({ address }: { address: string }) {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address,
      )}.json?access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
    )
    const jsonResponse = (await res.json()) as FeatureCollection
    if (jsonResponse.features.length === 0) return null
    const addressCoords = jsonResponse.features.find((feature) => feature.place_type.includes("address"))?.center
    const placeCoords = jsonResponse.features[0]?.center
    return addressCoords || placeCoords
  } catch (error) {
    Sentry.captureException(error)
    return null
  }
}

export async function getPlaces({ search }: { search: string }) {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        search,
      )}.json?access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`,
    )
    const jsonResponse = (await res.json()) as FeatureCollection
    if (jsonResponse.features.length === 0) return [] as { name: string; center: [number, number] }[]

    return jsonResponse.features.map((place) => ({
      name: place.place_name,
      center: place.center,
    }))
  } catch (error) {
    Sentry.captureException(error)
    return [] as { name: string; center: [number, number] }[]
  }
}

type Context = {
  id: string
  mapbox_id?: string
  wikidata?: string
  short_code?: string
  text: string
}[]

type Geometry = {
  type: string
  coordinates: [number, number]
}

type Properties = {
  accuracy?: string
  mapbox_id?: string
  wikidata?: string
}

type Feature = {
  id: string
  type: string
  place_type: string[]
  relevance: number
  properties?: Properties
  text: string
  place_name: string
  bbox?: [number, number, number, number]
  center: [number, number]
  geometry: Geometry
  context: Context
}

type FeatureCollection = {
  type: string
  query: [number, number]
  features: Feature[]
  attribution: string
}
