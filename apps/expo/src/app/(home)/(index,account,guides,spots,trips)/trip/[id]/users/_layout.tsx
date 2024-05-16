import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export default function Layout() {
  const backgroundColor = useBackgroundColor()

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{ presentation: "modal", contentStyle: { backgroundColor }, headerShown: false }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
    </Stack>
  )
}
