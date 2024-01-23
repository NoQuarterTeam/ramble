import { useBackgroundColor } from "~/lib/tailwind"

import { Stack } from "expo-router"

export default function EditSpotLayout() {
  const backgroundColor = useBackgroundColor()

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="type" />
      <Stack.Screen name="info" />
      <Stack.Screen name="amenities" />
      <Stack.Screen name="images" />
      <Stack.Screen name="confirm" />
    </Stack>
  )
}
