import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export default function SpotReportLayout() {
  const backgroundColor = useBackgroundColor()

  return (
    <Stack initialRouteName="index" screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="location" />
      <Stack.Screen name="info" />
      <Stack.Screen name="type" />
      <Stack.Screen name="images" />
    </Stack>
  )
}
