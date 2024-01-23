import { Stack } from "expo-router"
import { useBackgroundColor } from "../../../../lib/tailwind"

export default function AccountLayout() {
  const backgroundColor = useBackgroundColor()
  // const sharedScreens = getSharedScreens(AccountStack)

  return <Stack screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }} />
}
