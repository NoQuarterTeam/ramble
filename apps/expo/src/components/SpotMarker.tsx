import { MarkerView } from "@rnmapbox/maps"
import { cva } from "class-variance-authority"
import type { ClassValue } from "class-variance-authority/dist/types"
import { TouchableOpacity, View } from "react-native"

import type { SpotType } from "@ramble/database/types"
import { spotMarkerClusterColorTypes, spotMarkerColorTypes, spotMarkerTextColorTypes } from "@ramble/shared"

import type { RouterOutputs } from "~/lib/api"

import { PieChart } from "./PieChart"
import { SpotIconMap } from "./SpotIcon"
import { Text } from "./ui/Text"

interface MarkerProps {
  spot: { type: SpotType }
}

export function SpotMarker(props: MarkerProps) {
  return (
    <View className={spotMarkerColors({ type: props.spot.type })}>
      <SpotIconMap type={props.spot.type} size={18} className={spotMarkerIconColors({ type: props.spot.type })} />
    </View>
  )
}

type MarkerConfig = { type: Record<SpotType, ClassValue> }

const spotMarkerColors = cva<MarkerConfig>("sq-8 flex items-center justify-center rounded-full border shadow-md", {
  variants: {
    type: spotMarkerColorTypes,
  },
})
const spotMarkerIconColors = cva("", {
  variants: {
    type: spotMarkerTextColorTypes,
  },
})

type SpotClusterTypes = { [key in SpotType]?: number }

function ClusterMarker({ countAbbr, count, types }: { countAbbr: string | number; count: number; types: SpotClusterTypes }) {
  const outerSize = count > 150 ? 80 : count > 75 ? 64 : count > 10 ? 48 : 32
  // const outerSize = 32
  const innerSize = outerSize - 8
  return (
    <View className="relative flex items-center justify-center rounded-full border border-white dark:border-black">
      <PieChart
        size={outerSize}
        series={Object.values(types)}
        sliceColor={Object.keys(types).map((type) => spotMarkerClusterColorTypes[type as SpotType])}
      />
      <View className="absolute inset-0 flex items-center justify-center">
        <View className="flex items-center justify-center rounded-full border border-gray-100 bg-background shadow dark:border-gray-700 dark:bg-background-dark">
          <Text
            style={{ width: innerSize, height: innerSize, lineHeight: innerSize }}
            className="text-center text-black text-sm dark:text-white"
          >
            {countAbbr}
          </Text>
        </View>
      </View>
    </View>
  )
}

type SpotCluster = RouterOutputs["spot"]["clusters"][number]

interface SpotClusterMarkerProps {
  point: SpotCluster
  onPress: () => void
}
export function SpotClusterMarker(props: SpotClusterMarkerProps) {
  return (
    <MarkerView allowOverlap allowOverlapWithPuck coordinate={props.point.geometry.coordinates}>
      <TouchableOpacity activeOpacity={0.7} onPress={props.onPress} className="z-10">
        {props.point.properties.cluster ? (
          <ClusterMarker
            types={props.point.properties.types}
            countAbbr={props.point.properties.point_count_abbreviated}
            count={props.point.properties.point_count}
          />
        ) : (
          <SpotMarker spot={props.point.properties as { type: SpotType }} />
        )}
      </TouchableOpacity>
    </MarkerView>
  )
}
