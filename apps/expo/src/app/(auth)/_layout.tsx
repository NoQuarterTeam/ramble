import { useColorScheme } from "react-native"
import { Stack } from "expo-router"

export default function AuthLayout() {
  const colorScheme = useColorScheme()
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colorScheme === "light" ? "white" : "black" }, headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  )
}
