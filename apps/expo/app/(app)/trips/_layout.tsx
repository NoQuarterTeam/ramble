import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { useBackgroundColor } from "../../../lib/tailwind"
import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { TripsScreen } from "."

const TripsStack = createNativeStackNavigator<ScreenParamsList>()

export function TripsLayout() {
  const backgroundColor = useBackgroundColor()
  const sharedScreens = getSharedScreens(TripsStack)
  return (
    <TripsStack.Navigator screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <TripsStack.Screen name="TripsScreen" component={TripsScreen} />
      {sharedScreens}
    </TripsStack.Navigator>
  )
}
