import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { useBackgroundColor } from "../../../lib/tailwind"
import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { SpotsScreen } from "."

const SpotsStack = createNativeStackNavigator<ScreenParamsList>()

export function SpotsLayout() {
  const backgroundColor = useBackgroundColor()
  const sharedScreens = getSharedScreens(SpotsStack)
  return (
    <SpotsStack.Navigator screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <SpotsStack.Screen name="SpotsScreen" component={SpotsScreen} />
      {sharedScreens}
    </SpotsStack.Navigator>
  )
}
