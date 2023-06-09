import { useColorScheme } from "react-native"
import { Stack } from "expo-router"

export default function ListsLayout() {
  const theme = useColorScheme()
  const isDark = theme === "dark"
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}>
      <Stack.Screen name="[id]" />
    </Stack>
  )
}
