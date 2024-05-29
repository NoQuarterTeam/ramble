import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export default function AccountLayout() {
  const backgroundColor = useBackgroundColor()
  return (
    <Stack initialRouteName="index" screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="info" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="lists" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="van" />
    </Stack>
  )
}
