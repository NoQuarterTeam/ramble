import { useColorScheme, View } from "react-native"
import { Stack } from "expo-router"

export default function Layout() {
  const theme = useColorScheme()
  const isDark = theme === "dark"
  return (
    <View className="flex-1 p-4 py-20">
      <Stack
        initialRouteName="[id]"
        screenOptions={{ contentStyle: { backgroundColor: isDark ? "black" : "white" }, headerShown: false }}
      />
    </View>
  )
}
