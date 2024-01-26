import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export default function OnboardingLayout() {
  const backgroundColor = useBackgroundColor()
  return <Stack screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }} />
}
