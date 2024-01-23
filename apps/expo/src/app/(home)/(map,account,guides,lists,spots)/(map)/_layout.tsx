import { useBackgroundColor } from "../../../../lib/tailwind"

import { Stack } from "expo-router"

export default function MapLayout() {
  const backgroundColor = useBackgroundColor()

  return (
    <Stack initialRouteName="index" screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  )
}
