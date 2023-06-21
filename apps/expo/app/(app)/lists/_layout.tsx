import { useColorScheme } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { ListsScreen } from "."

const ListsStack = createNativeStackNavigator<ScreenParamsList>()

export function ListsLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const sharedScreens = getSharedScreens(ListsStack)
  return (
    <ListsStack.Navigator screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}>
      <ListsStack.Screen name="ListsScreen" component={ListsScreen} />
      {sharedScreens}
    </ListsStack.Navigator>
  )
}
