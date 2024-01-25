import colors from "@ramble/tailwind-config/src/colors"
import { CloudRain, Thermometer, MountainSnow, Users2, SunMoon } from "lucide-react-native"
import { View, TouchableOpacity, Switch } from "react-native"
import { Icon } from "~/components/Icon"
import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { useMe } from "~/lib/hooks/useMe"
import { usePreferences } from "~/lib/hooks/usePreferences"

export default function MapLayers() {
  const { preferences, setPreferences } = usePreferences()
  const me = useMe()

  return (
    <ModalView title="map layers">
      <View className="space-y-4">
        <View className="space-y-1">
          <TouchableOpacity
            onPress={() => setPreferences({ ...preferences, mapLayer: null })}
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
              {preferences.mapLayer === null && <View className="sq-4 bg-primary rounded-full" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPreferences({ ...preferences, mapLayer: "rain" })}
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
              {preferences.mapLayer === "rain" && <View className="sq-4 bg-primary rounded-full" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPreferences({ ...preferences, mapLayer: "temp" })}
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
              {preferences.mapLayer === "temp" && <View className="sq-4 bg-primary rounded-full" />}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPreferences({ ...preferences, mapLayer: "satellite" })}
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
              {preferences.mapLayer === "satellite" && <View className="sq-4 bg-primary rounded-full" />}
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
              value={preferences.mapUsers}
              onValueChange={() => setPreferences({ ...preferences, mapUsers: !preferences.mapUsers })}
            />
          </View>
        )}
        <Text className="py-2">More coming soon!</Text>
      </View>
    </ModalView>
  )
}
