import { useColorScheme } from "react-native"

import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { SpotsScreen } from "."
import { SpotsMapScreen } from "./map"
import { getSharedScreens } from "../shared/getSharedScreens"
import { ScreenParamsList } from "../../router"

const SpotsStack = createNativeStackNavigator<ScreenParamsList>()

export function SpotsLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const sharedScreens = getSharedScreens(SpotsStack)
  return (
    <SpotsStack.Navigator
      initialRouteName="SpotsMapScreen"
      screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}
    >
      <SpotsStack.Screen name="SpotsMapScreen" component={SpotsMapScreen} />
      <SpotsStack.Screen name="SpotsScreen" component={SpotsScreen} />
      {sharedScreens}
    </SpotsStack.Navigator>
  )
}
