import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { useBackgroundColor } from "../../../lib/tailwind"
import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { GuidesScreen } from "."

const GuidesStack = createNativeStackNavigator<ScreenParamsList>()

export function GuidesLayout() {
  const backgroundColor = useBackgroundColor()
  const sharedScreens = getSharedScreens(GuidesStack)
  return (
    <GuidesStack.Navigator screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <GuidesStack.Screen name="GuidesScreen" component={GuidesScreen} />
      {sharedScreens}
    </GuidesStack.Navigator>
  )
}
