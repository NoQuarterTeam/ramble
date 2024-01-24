import { Stack } from "expo-router"
import { useBackgroundColor } from "~/lib/tailwind"

export default function Layout() {
  const backgroundColor = useBackgroundColor()
  return <Stack initialRouteName="[id]/index" screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }} />
}
