import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { ProfileScreen } from "."
import { SettingsScreen } from "./settings"
import { useColorScheme } from "react-native"

import { getSharedScreens } from "../shared/getSharedScreens"

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
      <ProfileStack.Screen name="SettingsScreen" component={SettingsScreen} />
      {sharedScreens}
    </ProfileStack.Navigator>
  )
}
