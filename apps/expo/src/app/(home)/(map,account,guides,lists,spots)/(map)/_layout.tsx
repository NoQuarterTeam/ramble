import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export default function Layout() {
  const backgroundColor = useBackgroundColor()
  return (
    <Stack initialRouteName="index" screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="layers" options={{ presentation: "modal" }} />
      <Stack.Screen name="filters" options={{ presentation: "modal" }} />
    </Stack>
  )
}
