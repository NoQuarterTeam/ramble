import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { RegisterScreen } from "./register"
import { LoginScreen } from "./login"
import { useColorScheme } from "react-native"

const AuthStack = createNativeStackNavigator()

export function AuthLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  return (
    <AuthStack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}
    >
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} />
    </AuthStack.Navigator>
  )
}
