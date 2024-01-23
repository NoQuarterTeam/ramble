import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { useBackgroundColor } from "../../../../../lib/tailwind"
import { type ScreenParamsList, useParams } from "../../../../router"
import { SpotReportScreen } from "."
import { SpotReportAmenitiesScreen } from "./amenities"
import { SpotReportImagesScreen } from "./images"
import { SpotReportInfoScreen } from "./info"
import { SpotReportLocationScreen } from "./location"
import { SpotReportTypeScreen } from "./type"

const SpotReportStack = createNativeStackNavigator<ScreenParamsList>()

export function SpotReportLayout() {
  const { params } = useParams<"SpotReportLayout">()
  const backgroundColor = useBackgroundColor()

  return (
    <SpotReportStack.Navigator
      initialRouteName="SpotReportScreen"
      screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}
    >
      <SpotReportStack.Screen name="SpotReportScreen" initialParams={params} component={SpotReportScreen} />
      <SpotReportStack.Screen name="SpotReportLocationScreen" component={SpotReportLocationScreen} />
      <SpotReportStack.Screen name="SpotReportInfoScreen" component={SpotReportInfoScreen} />
      <SpotReportStack.Screen name="SpotReportTypeScreen" component={SpotReportTypeScreen} />
      <SpotReportStack.Screen name="SpotReportAmenitiesScreen" component={SpotReportAmenitiesScreen} />
      <SpotReportStack.Screen name="SpotReportImagesScreen" component={SpotReportImagesScreen} />
    </SpotReportStack.Navigator>
  )
}
