import { z } from "zod"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import colors from "@ramble/tailwind-config/src/colors"
import { CloudRain, Thermometer, MountainSnow, Users2, SunMoon } from "lucide-react-native"
import { View, TouchableOpacity, Switch } from "react-native"
import { Icon } from "~/components/Icon"
import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { useMe } from "~/lib/hooks/useMe"

const mapLayersSchema = z.object({
  layer: z.enum(["rain", "temp", "satellite"]).nullable(),
  shouldShowUsers: z.boolean(),
})
export const useMapLayers = create<{
  layers: z.infer<typeof mapLayersSchema>
  setLayers: (preference: Partial<z.infer<typeof mapLayersSchema>>) => void
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
  const me = useMe()

  return (
    <ModalView title="map layers">
      <View className="space-y-4">
        <View className="space-y-1">
          <TouchableOpacity
            onPress={() => setLayers({ ...layers, layer: null })}
            className="flex flex-row items-center justify-between space-x-2 rounded border border-gray-200 p-3 dark:border-gray-700"
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
              {layers.layer === null && <View className="sq-4 bg-primary rounded-full" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLayers({ ...layers, layer: "rain" })}
            className="flex flex-row items-center justify-between space-x-2 rounded border border-gray-200 p-3 dark:border-gray-700"
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
              {layers.layer === "rain" && <View className="sq-4 bg-primary rounded-full" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLayers({ ...layers, layer: "temp" })}
            className="flex flex-row items-center justify-between space-x-2 rounded border border-gray-200 p-3 dark:border-gray-700"
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
              {layers.layer === "temp" && <View className="sq-4 bg-primary rounded-full" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLayers({ ...layers, layer: "satellite" })}
            className="flex flex-row items-center justify-between space-x-2 rounded border border-gray-200 p-3 dark:border-gray-700"
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
              {layers.layer === "satellite" && <View className="sq-4 bg-primary rounded-full" />}
            </View>
          </TouchableOpacity>
        </View>
        <View className="h-1 border-t border-gray-200 dark:border-gray-700" />

        {!me && (
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
              onValueChange={() => setLayers({ ...layers, shouldShowUsers: !layers.shouldShowUsers })}
            />
          </View>
        )}
        <Text className="py-2">More coming soon!</Text>
      </View>
    </ModalView>
  )
}
