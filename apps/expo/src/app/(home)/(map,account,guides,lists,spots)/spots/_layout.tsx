import { Stack } from "expo-router"
import { useBackgroundColor } from "../../../../lib/tailwind"

export default function SpotsLayout() {
  const backgroundColor = useBackgroundColor()

  return <Stack screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }} />
}
