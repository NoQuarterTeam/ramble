import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export default function NewSpotLayout() {
  const backgroundColor = useBackgroundColor()

  return (
    <Stack screenOptions={{ presentation: "card", contentStyle: { backgroundColor }, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="type" />
      <Stack.Screen name="info" />
      <Stack.Screen name="amenities" />
      <Stack.Screen name="images" />
      <Stack.Screen name="confirm" />
    </Stack>
  )
}
