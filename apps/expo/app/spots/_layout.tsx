import { Stack } from "expo-router"
import { View, useColorScheme } from "react-native"

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "[id]",
}

export default function Layout() {
  const theme = useColorScheme()
  const isDark = theme === "dark"
  return (
    <View className="flex-1 p-4 py-20">
      <Stack screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }} />
    </View>
  )
}
