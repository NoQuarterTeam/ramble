import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { useBackgroundColor } from "../../../lib/tailwind"
import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { SpotsMapScreen } from "."

const MapStack = createNativeStackNavigator<ScreenParamsList>()

export function MapLayout() {
  const backgroundColor = useBackgroundColor()
  const sharedScreens = getSharedScreens(MapStack)
  return (
    <MapStack.Navigator
      initialRouteName="SpotsMapScreen"
      screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}
    >
      <MapStack.Screen name="SpotsMapScreen" component={SpotsMapScreen} />
      {sharedScreens}
    </MapStack.Navigator>
  )
}
