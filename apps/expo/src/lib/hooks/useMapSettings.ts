import * as React from "react"
export type MapSettings = {
  maxLat: number
  maxLng: number
  minLat: number
  minLng: number
  zoom: number
}
export function useMapSettings() {
  return React.useState<MapSettings | null>(null)
}
