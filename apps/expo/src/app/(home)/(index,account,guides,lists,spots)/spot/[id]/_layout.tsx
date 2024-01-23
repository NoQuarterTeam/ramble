import { Stack } from "expo-router"
import { useBackgroundColor } from "~/lib/tailwind"

export default function Layout() {
  const backgroundColor = useBackgroundColor()

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" options={{ presentation: "modal" }} />
      <Stack.Screen name="reviews" options={{ presentation: "modal" }} />
      <Stack.Screen name="report" options={{ presentation: "modal" }} />
      <Stack.Screen name="save" options={{ presentation: "modal" }} />
      <Stack.Screen name="delete" options={{ presentation: "modal" }} />
      <Stack.Screen name="save-spot-images" options={{ presentation: "modal" }} />
    </Stack>
  )
}
