import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export default function AccountLayout() {
  const backgroundColor = useBackgroundColor()
  return <Stack initialRouteName="index" screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }} />
}
