import { View, useColorScheme } from "react-native"
import { Stack } from "expo-router"

export default function AuthLayout() {
  const colorScheme = useColorScheme()
  return (
    <View className="flex-1 px-4 py-20">
      <Stack
        screenOptions={{ contentStyle: { backgroundColor: colorScheme === "light" ? "white" : "black" }, headerShown: false }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </View>
  )
}
