import { Stack } from "expo-router"
import { useBackgroundColor } from "../../../../lib/tailwind"

export default function ListsLayout() {
  const backgroundColor = useBackgroundColor()

  return <Stack screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }} />
}
