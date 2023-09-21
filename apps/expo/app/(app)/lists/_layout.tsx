import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { useBackgroundColor } from "../../../lib/tailwind"
import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { ListsScreen } from "."

const ListsStack = createNativeStackNavigator<ScreenParamsList>()

export function ListsLayout() {
  const backgroundColor = useBackgroundColor()
  const sharedScreens = getSharedScreens(ListsStack)
  return (
    <ListsStack.Navigator screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <ListsStack.Screen name="ListsScreen" component={ListsScreen} />
      {sharedScreens}
    </ListsStack.Navigator>
  )
}
