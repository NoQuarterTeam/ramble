import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { ListsScreen } from "."
import { getSharedScreens } from "../shared/getSharedScreens"
import { useColorScheme } from "react-native"

const ListsStack = createNativeStackNavigator()

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
