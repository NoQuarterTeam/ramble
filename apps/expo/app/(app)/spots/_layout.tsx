import { useColorScheme } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { SpotsScreen } from "."

const SpotsStack = createNativeStackNavigator<ScreenParamsList>()

export function SpotsLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const sharedScreens = getSharedScreens(SpotsStack)
  return (
    <SpotsStack.Navigator screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}>
      <SpotsStack.Screen name="SpotsScreen" component={SpotsScreen} />
      {sharedScreens}
    </SpotsStack.Navigator>
  )
}
