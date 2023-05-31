import { useColorScheme, View } from "react-native"
import { Stack } from "expo-router"

export default function ProfileLayout() {
  const colorScheme = useColorScheme()
  return (
    <View className="flex-1 px-4 py-20">
      <Stack
        screenOptions={{ contentStyle: { backgroundColor: colorScheme === "light" ? "white" : "black" }, headerShown: false }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </View>
  )
}
