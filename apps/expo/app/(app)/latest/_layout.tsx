import { useColorScheme } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { LatestScreen } from "."

const LatestStack = createNativeStackNavigator<ScreenParamsList>()

export function LatestLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const sharedScreens = getSharedScreens(LatestStack)
  return (
    <LatestStack.Navigator screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}>
      <LatestStack.Screen name="LatestScreen" component={LatestScreen} />
      {sharedScreens}
    </LatestStack.Navigator>
  )
}
