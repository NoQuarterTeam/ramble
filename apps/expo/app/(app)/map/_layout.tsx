import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { useBackgroundColor } from "../../../lib/tailwind"
import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { MapScreen } from "."

const MapStack = createNativeStackNavigator<ScreenParamsList>()

export function MapLayout() {
  const backgroundColor = useBackgroundColor()
  const sharedScreens = getSharedScreens(MapStack)
  return (
    <MapStack.Navigator initialRouteName="MapScreen" screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <MapStack.Screen name="MapScreen" component={MapScreen} />
      {sharedScreens}
    </MapStack.Navigator>
  )
}
