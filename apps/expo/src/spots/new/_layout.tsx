import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { useBackgroundColor } from "../../../../lib/tailwind"
import { useParams, type ScreenParamsList } from "../../../router"
import { NewSpotLocationScreen } from "."
import { NewSpotAmenitiesScreen } from "./amenities"
import { NewSpotConfirmScreen } from "./confirm"
import { NewSpotImagesScreen } from "./images"
import { NewSpotInfoScreen } from "./info"
import { NewSpotTypeScreen } from "./type"

const NewSpotStack = createNativeStackNavigator<ScreenParamsList>()

export function NewSpotLayout() {
  const { params } = useParams<"NewSpotLayout">()
  const backgroundColor = useBackgroundColor()

  return (
    <NewSpotStack.Navigator
      initialRouteName="NewSpotLocationScreen"
      screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}
    >
      <NewSpotStack.Screen name="NewSpotLocationScreen" component={NewSpotLocationScreen} initialParams={params} />
      <NewSpotStack.Screen name="NewSpotTypeScreen" component={NewSpotTypeScreen} />
      <NewSpotStack.Screen name="NewSpotInfoScreen" component={NewSpotInfoScreen} />
      <NewSpotStack.Screen name="NewSpotAmenitiesScreen" component={NewSpotAmenitiesScreen} />
      <NewSpotStack.Screen name="NewSpotImagesScreen" component={NewSpotImagesScreen} />
      <NewSpotStack.Screen name="NewSpotConfirmScreen" component={NewSpotConfirmScreen} />
    </NewSpotStack.Navigator>
  )
}
