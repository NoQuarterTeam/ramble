import { useColorScheme } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { type ScreenParamsList, useParams } from "../../../../../router"
import { EditSpotLocationScreen } from "."
import { EditSpotAmenitiesScreen } from "./amenities"
import { EditSpotConfirmScreen } from "./confirm"
import { EditSpotImagesScreen } from "./images"
import { EditSpotOptionsScreen } from "./info"
import { EditSpotTypeScreen } from "./type"

const EditSpotStack = createNativeStackNavigator<ScreenParamsList>()

export function EditSpotLayout() {
  const { params } = useParams<"EditSpotLayout">()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  return (
    <EditSpotStack.Navigator
      initialRouteName="EditSpotLocationScreen"
      screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}
    >
      <EditSpotStack.Screen name="EditSpotLocationScreen" initialParams={params} component={EditSpotLocationScreen} />
      <EditSpotStack.Screen name="EditSpotTypeScreen" component={EditSpotTypeScreen} />
      <EditSpotStack.Screen name="EditSpotOptionsScreen" component={EditSpotOptionsScreen} />
      <EditSpotStack.Screen name="EditSpotAmenitiesScreen" component={EditSpotAmenitiesScreen} />
      <EditSpotStack.Screen name="EditSpotImagesScreen" component={EditSpotImagesScreen} />
      <EditSpotStack.Screen name="EditSpotConfirmScreen" component={EditSpotConfirmScreen} />
    </EditSpotStack.Navigator>
  )
}
