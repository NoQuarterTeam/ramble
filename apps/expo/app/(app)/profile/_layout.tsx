import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { ProfileScreen } from "."
import { AccountScreen } from "./account"
import { useColorScheme } from "react-native"

import { getSharedScreens } from "../shared/getSharedScreens"
import { VanScreen } from "./van"

const ProfileStack = createNativeStackNavigator()

export function ProfileLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const sharedScreens = getSharedScreens(ProfileStack)
  return (
    <ProfileStack.Navigator
      initialRouteName="ProfileScreen"
      screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}
    >
      <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <ProfileStack.Screen name="AccountScreen" component={AccountScreen} />
      <ProfileStack.Screen name="VanScreen" component={VanScreen} />
      {sharedScreens}
    </ProfileStack.Navigator>
  )
}
