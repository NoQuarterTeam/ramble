import { useColorScheme } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import OnboardingStep1Screen from "./1"
import OnboardingStep2Screen from "./2"
import OnboardingStep3Screen from "./3"

const OnboardingStack = createNativeStackNavigator()

export function OnboardingLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  return (
    <OnboardingStack.Navigator
      initialRouteName="OnboardingStep1Screen"
      screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}
    >
      <OnboardingStack.Screen name="OnboardingStep1Screen" component={OnboardingStep1Screen} />
      <OnboardingStack.Screen name="OnboardingStep2Screen" component={OnboardingStep2Screen} />
      <OnboardingStack.Screen name="OnboardingStep3Screen" component={OnboardingStep3Screen} />
    </OnboardingStack.Navigator>
  )
}
