import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export default function Layout() {
  const backgroundColor = useBackgroundColor()

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new-stop" options={{ presentation: "modal" }} />
    </Stack>
  )
}
