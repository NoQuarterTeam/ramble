import AsyncStorage from "@react-native-async-storage/async-storage"
import { Link } from "expo-router"
import { CloudRain, Earth, MountainSnow, SunMoon, Thermometer, Users2 } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import { Switch, TouchableOpacity, View } from "react-native"
import { z } from "zod"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { join } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"
import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { useMe } from "~/lib/hooks/useMe"

const mapLayersSchema = z.object({
  layer: z.enum(["rain", "temp", "satellite", "bioRegions"]).nullable(),
  shouldShowUsers: z.boolean(),
})

type MapLayerOptions = z.infer<typeof mapLayersSchema>

export const useMapLayers = create<{
  layers: MapLayerOptions
  setLayers: (preference: Partial<MapLayerOptions>) => void
}>()(
  persist(
    (set) => ({
      layers: { layer: null, shouldShowUsers: true },
      setLayers: (layer) => set((state) => ({ layers: { ...state.layers, ...layer } })),
    }),
    { name: "ramble.map.layers", storage: createJSONStorage(() => AsyncStorage) },
  ),
)

export default function MapLayers() {
  const { layers, setLayers } = useMapLayers()
  const { me } = useMe()
  const posthog = usePostHog()

  const onSetMapLayer = (layer: MapLayerOptions["layer"]) => {
    setLayers({ ...layers, layer })
    posthog.capture("map layer changed", { layer })
  }

  return (
    <ModalView title="map layers">
      <View className="space-y-4">
        {!me && (
          <View className="flex flex-row space-x-1">
            <Link href="/login" push asChild>
              <Text className="text-base underline">Log in</Text>
            </Link>
            <Text className="text-base">to access more layers</Text>
          </View>
        )}
        <View ph-no-capture className="space-y-1">
          <TouchableOpacity
            onPress={() => onSetMapLayer(null)}
            className={join(
              "flex flex-row items-center justify-between space-x-2 rounded border border-gray-200 p-3 dark:border-gray-700",
            )}
          >
            <View className="flex flex-row items-center space-x-3">
              <Icon icon={SunMoon} size={24} />
              <View>
                <Text className="h-[25px] text-lg">Default</Text>
                <Text numberOfLines={2} style={{ lineHeight: 16 }} className="max-w-[220px] text-sm opacity-75">
                  Show the default map styling
                </Text>
              </View>
            </View>
            <View className="sq-6 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
              {layers.layer === null && <View className="sq-4 rounded-full bg-primary" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSetMapLayer("rain")}
            disabled={!me}
            className={join(
              "flex flex-row items-center justify-between space-x-2 rounded border border-gray-200 p-3 dark:border-gray-700",
              !me && "opacity-70",
            )}
          >
            <View className="flex flex-row items-center space-x-3">
              <Icon icon={CloudRain} size={24} />
              <View>
                <Text className="h-[25px] text-lg">Rain</Text>
                <Text numberOfLines={2} style={{ lineHeight: 16 }} className="max-w-[220px] text-sm opacity-75">
                  Shows the current rain radar
                </Text>
              </View>
            </View>
            <View className="sq-6 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
              {layers.layer === "rain" && <View className="sq-4 rounded-full bg-primary" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSetMapLayer("temp")}
            disabled={!me}
            className={join(
              "flex flex-row items-center justify-between space-x-2 rounded border border-gray-200 p-3 dark:border-gray-700",
              !me && "opacity-70",
            )}
          >
            <View className="flex flex-row items-center space-x-3">
              <Icon icon={Thermometer} size={24} />
              <View>
                <Text className="h-[25px] text-lg">Temperature</Text>
                <Text numberOfLines={2} style={{ lineHeight: 16 }} className="max-w-[220px] text-sm opacity-75">
                  Shows the current temperature
                </Text>
              </View>
            </View>
            <View className="sq-6 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
              {layers.layer === "temp" && <View className="sq-4 rounded-full bg-primary" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSetMapLayer("bioRegions")}
            disabled={!me}
            className={join(
              "flex flex-row items-center justify-between space-x-2 rounded border border-gray-200 p-3 dark:border-gray-700",
              !me && "opacity-70",
            )}
          >
            <View className="flex flex-row items-center space-x-3">
              <Icon icon={Earth} size={24} />
              <View>
                <Text className="h-[25px] text-lg">Bio Regions</Text>
                <Text numberOfLines={2} style={{ lineHeight: 16 }} className="max-w-[220px] text-sm opacity-75">
                  Shows bioregions
                </Text>
              </View>
            </View>
            <View className="sq-6 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
              {layers.layer === "bioRegions" && <View className="sq-4 rounded-full bg-primary" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSetMapLayer("satellite")}
            disabled={!me}
            className={join(
              "flex flex-row items-center justify-between space-x-2 rounded border border-gray-200 p-3 dark:border-gray-700",
              !me && "opacity-70",
            )}
          >
            <View className="flex flex-row items-center space-x-3">
              <Icon icon={MountainSnow} size={24} />
              <View>
                <Text className="h-[25px] text-lg">Satellite view</Text>
                <Text numberOfLines={2} style={{ lineHeight: 16 }} className="max-w-[220px] text-sm opacity-75">
                  Changes the map to satellite view
                </Text>
              </View>
            </View>
            <View className="sq-6 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
              {layers.layer === "satellite" && <View className="sq-4 rounded-full bg-primary" />}
            </View>
          </TouchableOpacity>
        </View>
        <View className="h-1 border-gray-200 border-t dark:border-gray-700" />

        {me && (
          <View className="flex flex-row items-center justify-between space-x-2 p-3">
            <View className="flex flex-row items-center space-x-3">
              <Icon icon={Users2} size={24} />
              <View>
                <Text className="h-[25px] text-lg">Ramble users</Text>
                <Text numberOfLines={2} style={{ lineHeight: 16 }} className="max-w-[220px] text-sm opacity-75">
                  See the approximate location of other Ramble users
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ true: colors.primary[600] }}
              value={layers.shouldShowUsers}
              onValueChange={() => {
                posthog.capture("map should show users", { shouldShowUsers: !layers.shouldShowUsers })
                setLayers({ ...layers, shouldShowUsers: !layers.shouldShowUsers })
              }}
            />
          </View>
        )}
        <Text className="py-2">More coming soon!</Text>
      </View>
    </ModalView>
  )
}
