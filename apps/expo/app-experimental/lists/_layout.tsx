import { useColorScheme } from "react-native"
import { Stack } from "expo-router"

export default function ListsLayout() {
  const colorScheme = useColorScheme()
  return (
    <Stack
      initialRouteName="[id]"
      screenOptions={{ contentStyle: { backgroundColor: colorScheme === "light" ? "white" : "black" }, headerShown: false }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  )
}
