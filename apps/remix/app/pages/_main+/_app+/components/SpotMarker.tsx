import { Marker } from "react-map-gl"
import { type MarkerEvent, type MarkerInstance } from "react-map-gl/dist/esm/types"
import { cva } from "class-variance-authority"
import { type ClassValue } from "class-variance-authority/types"

import type { SpotType } from "@ramble/database/types"
import {
  spotMarkerClusterColorTypes,
  spotMarkerColorTypes,
  spotMarkerTextColorTypes,
  spotMarkerTriangleColorTypes,
} from "@ramble/shared"

import { PieChart } from "~/components/PieChart"
import { SpotIcon } from "~/components/SpotIcon"
import { type SpotCluster, type SpotClusterTypes } from "~/pages/api+/clusters"

interface MarkerProps {
  spot: { type: SpotType }
  isInteractable?: boolean
}

export function SpotMarker({ isInteractable = true, ...props }: MarkerProps) {
  return (
    <div className="relative">
      <div className={spotMarker({ type: props.spot.type, isInteractable })}>
        <SpotIcon type={props.spot.type} className={spotMarkerIconColors({ type: props.spot.type })} />
      </div>
      <div className={spotTriangleColors({ type: props.spot.type })} />
    </div>
  )
}

type MarkerConfig = { type: Record<SpotType, ClassValue>; isInteractable: Record<"true", ClassValue> }

const spotMarker = cva<MarkerConfig>("sq-8 flex items-center justify-center rounded-full border shadow-md", {
  variants: {
    type: spotMarkerColorTypes,
    isInteractable: {
      true: "cursor-pointer transition-transform hover:scale-110",
    },
  },
})

type MarkerIconConfig = { type: Record<SpotType, ClassValue> }

const spotMarkerIconColors = cva<MarkerIconConfig>("sq-4", {
  variants: {
    type: spotMarkerTextColorTypes,
  },
})

export const spotTriangleColors = cva<MarkerIconConfig>(
  "sq-3 absolute -bottom-[3px] left-1/2 -z-[1] -translate-x-1/2 rotate-45 shadow",
  {
    variants: {
      type: spotMarkerTriangleColorTypes,
    },
  },
)

function ClusterMarker({ countAbbr, count, types }: { countAbbr: string | number; count: number; types: SpotClusterTypes }) {
  const outerSize = count > 150 ? 80 : count > 75 ? 64 : count > 10 ? 48 : 32
  const innerSize = outerSize - 8
  return (
    <div className="center relative cursor-pointer rounded-full border border-white shadow transition-transform hover:scale-110 dark:border-black">
      <PieChart
        size={outerSize}
        series={Object.values(types)}
        sliceColor={Object.keys(types).map((type) => spotMarkerClusterColorTypes[type as SpotType])}
      />
      <div className="center absolute inset-0">
        <p
          style={{ width: innerSize, height: innerSize, lineHeight: innerSize }}
          className="center bg-background rounded-full text-sm text-black shadow dark:text-white"
        >
          {countAbbr}
        </p>
      </div>
    </div>
  )
}

interface SpotClusterMarkerProps {
  onClick: (e: MarkerEvent<MarkerInstance, MouseEvent>) => void
  point: SpotCluster
}
export function SpotClusterMarker(props: SpotClusterMarkerProps) {
  return (
    <Marker
      onClick={props.onClick}
      anchor="bottom"
      longitude={props.point.geometry.coordinates[0]!}
      latitude={props.point.geometry.coordinates[1]!}
    >
      {props.point.properties.cluster ? (
        <ClusterMarker
          types={props.point.properties.types}
          countAbbr={props.point.properties.point_count_abbreviated}
          count={props.point.properties.point_count}
        />
      ) : (
        <SpotMarker spot={props.point.properties as { type: SpotType }} />
      )}
    </Marker>
  )
}
