import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { useBackgroundColor } from "../../../lib/tailwind"
import { type ScreenParamsList } from "../../router"
import { getSharedScreens } from "../shared/getSharedScreens"
import { AccountScreen } from "."
import { AccountFeedbackScreen } from "./feedback"
import { AccountInfoScreen } from "./info"
import { InterestsScreen } from "./interests"
import { AccountSettingsScreen } from "./settings"
import { VanScreen } from "./van"
import { AccountInviteScreen } from "./invite"

const AccountStack = createNativeStackNavigator<ScreenParamsList>()

export function AccountLayout() {
  const backgroundColor = useBackgroundColor()
  const sharedScreens = getSharedScreens(AccountStack)

  return (
    <AccountStack.Navigator
      initialRouteName="AccountScreen"
      screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}
    >
      <AccountStack.Screen name="AccountScreen" component={AccountScreen} />
      <AccountStack.Screen name="AccountInfoScreen" component={AccountInfoScreen} />
      <AccountStack.Screen name="AccountVanScreen" component={VanScreen} />
      <AccountStack.Screen name="AccountInterestsScreen" component={InterestsScreen} />
      <AccountStack.Screen name="AccountSettingsScreen" component={AccountSettingsScreen} />
      <AccountStack.Screen name="AccountInviteScreen" component={AccountInviteScreen} />
      <AccountStack.Screen name="AccountFeedbackScreen" component={AccountFeedbackScreen} />
      {sharedScreens}
    </AccountStack.Navigator>
  )
}
