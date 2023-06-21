import { useColorScheme } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { ProfileScreen } from "."
import { AccountScreen } from "./account"
import { InterestsScreen } from "./interests"
import { VanScreen } from "./van"

const ProfileStack = createNativeStackNavigator<ScreenParamsList>()

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
      <ProfileStack.Screen name="InterestsScreen" component={InterestsScreen} />
      {sharedScreens}
    </ProfileStack.Navigator>
  )
}
