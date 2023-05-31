import { Stack } from "expo-router"
import { useColorScheme } from "react-native"

export default function MapLayout() {
  const colorScheme = useColorScheme()
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{ contentStyle: { backgroundColor: colorScheme === "light" ? "white" : "black" }, headerShown: false }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="latest" />
    </Stack>
  )
}
