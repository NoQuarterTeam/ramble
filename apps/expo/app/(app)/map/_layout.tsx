import { useColorScheme } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { SpotsMapScreen } from "."

const MapStack = createNativeStackNavigator<ScreenParamsList>()

export function MapLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const sharedScreens = getSharedScreens(MapLayout)
  return (
    <MapStack.Navigator
      initialRouteName="SpotsMapScreen"
      screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}
    >
      <MapStack.Screen name="SpotsMapScreen" component={SpotsMapScreen} />
      {sharedScreens}
    </MapStack.Navigator>
  )
}
