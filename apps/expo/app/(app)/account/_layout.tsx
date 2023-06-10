import { useColorScheme } from "react-native"
import { Stack } from "expo-router"

export default function ProfileLayout() {
  const colorScheme = useColorScheme()
  return (
    <Stack
      screenOptions={{ contentStyle: { backgroundColor: colorScheme === "light" ? "white" : "black" }, headerShown: false }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
    </Stack>
  )
}
