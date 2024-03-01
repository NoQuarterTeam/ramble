import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export default function Layout() {
  const backgroundColor = useBackgroundColor()

  return (
    <Stack initialRouteName="index" screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="images" />
      <Stack.Screen name="edit" options={{ presentation: "modal" }} />
      <Stack.Screen name="users" options={{ presentation: "modal" }} />
    </Stack>
  )
}
