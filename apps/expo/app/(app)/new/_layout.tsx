import { useColorScheme } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { type ScreenParamsList } from "../../router"
import { NewSpotLocationScreen } from "."
import { NewSpotTypeScreen } from "./type"
import { NewSpotOptionsScreen } from "./info"
import { NewSpotAmenitiesScreen } from "./amenities"
import { NewSpotImagesScreen } from "./images"
import { NewSpotConfirmScreen } from "./confirm"

const NewSpotStack = createNativeStackNavigator<ScreenParamsList>()

export function NewSpotLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  return (
    <NewSpotStack.Navigator
      initialRouteName="NewSpotLocationScreen"
      screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}
    >
      <NewSpotStack.Screen name="NewSpotLocationScreen" component={NewSpotLocationScreen} />
      <NewSpotStack.Screen name="NewSpotTypeScreen" component={NewSpotTypeScreen} />
      <NewSpotStack.Screen name="NewSpotOptionsScreen" component={NewSpotOptionsScreen} />
      <NewSpotStack.Screen name="NewSpotAmenitiesScreen" component={NewSpotAmenitiesScreen} />
      <NewSpotStack.Screen name="NewSpotImagesScreen" component={NewSpotImagesScreen} />
      <NewSpotStack.Screen name="NewSpotConfirmScreen" component={NewSpotConfirmScreen} />
    </NewSpotStack.Navigator>
  )
}
