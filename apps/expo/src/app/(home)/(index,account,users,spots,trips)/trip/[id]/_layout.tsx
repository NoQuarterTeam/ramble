import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export default function Layout() {
  const backgroundColor = useBackgroundColor()

  return (
    <Stack initialRouteName="index" screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="media" />
      <Stack.Screen name="find-spot" />
      <Stack.Screen name="items" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-location" options={{ presentation: "modal" }} />
      <Stack.Screen name="edit" options={{ presentation: "modal" }} />
      <Stack.Screen name="users" options={{ presentation: "modal" }} />
      <Stack.Screen name="layers" options={{ presentation: "modal" }} />
    </Stack>
  )
}
