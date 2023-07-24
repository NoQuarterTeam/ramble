import { useColorScheme } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { AccountScreen } from "."
import { AccountInfoScreen } from "./info"
import { InterestsScreen } from "./interests"
import { VanScreen } from "./van"

const AccountStack = createNativeStackNavigator<ScreenParamsList>()

export function AccountLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const sharedScreens = getSharedScreens(AccountStack)
  return (
    <AccountStack.Navigator
      initialRouteName="AccountScreen"
      screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}
    >
      <AccountStack.Screen name="AccountScreen" component={AccountScreen} />
      <AccountStack.Screen name="AccountInfoScreen" component={AccountInfoScreen} />
      <AccountStack.Screen name="VanScreen" component={VanScreen} />
      <AccountStack.Screen name="InterestsScreen" component={InterestsScreen} />
      {sharedScreens}
    </AccountStack.Navigator>
  )
}
