import { Stack } from "expo-router"

import { useBackgroundColor } from "~/lib/tailwind"

export default function SpotsReviewsLayout() {
  const backgroundColor = useBackgroundColor()

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }}>
      <Stack.Screen name="[reviewId]" />
    </Stack>
  )
}
