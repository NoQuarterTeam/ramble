import type { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position"

import * as React from "react"
export type MapSettings = {
  maxLat: number
  maxLng: number
  minLat: number
  minLng: number
  zoom: number
  center?: Position
}
export function useMapSettings() {
  return React.useState<MapSettings | null>(null)
}
