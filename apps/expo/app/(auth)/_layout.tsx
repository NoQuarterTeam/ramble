import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { LoginScreen } from "./login"
import { RegisterScreen } from "./register"

const AuthStack = createNativeStackNavigator()

export function AuthLayout() {
  return (
    <AuthStack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} />
    </AuthStack.Navigator>
  )
}
