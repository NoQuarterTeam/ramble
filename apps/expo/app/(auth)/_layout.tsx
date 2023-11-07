import * as React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { LoginScreen } from "./login"
import { RegisterScreen } from "./register"
import { RequestAccessScreen } from "./request-access"
import { useAsyncStorage } from "../../lib/hooks/useAsyncStorage"
import { REGISTER_CHECK_KEY } from "../../components/RegisterCheck"

const AuthStack = createNativeStackNavigator()

export function AuthLayout() {
  const [isChecked, setIsChecked, isReady] = useAsyncStorage(REGISTER_CHECK_KEY, false)

  React.useEffect(() => {
    if (!isReady || isChecked) return
    setIsChecked(true)
  }, [isReady, setIsChecked, isChecked])
  return (
    <AuthStack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} />
      <AuthStack.Screen name="RequestAccessScreen" component={RequestAccessScreen} />
    </AuthStack.Navigator>
  )
}
