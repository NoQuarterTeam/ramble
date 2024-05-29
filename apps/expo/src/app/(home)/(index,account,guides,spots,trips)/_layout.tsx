import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export const unstable_settings = {
  initialRouteName: "(map)",
}

export default function Layout() {
  const backgroundColor = useBackgroundColor()
  return <Stack screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }} />
}
