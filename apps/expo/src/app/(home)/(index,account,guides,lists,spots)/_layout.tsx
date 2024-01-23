import { Stack } from "expo-router"
import { useBackgroundColor } from "~/lib/tailwind"

export default function Layout() {
  const backgroundColor = useBackgroundColor()

  return <Stack screenOptions={{ contentStyle: { backgroundColor }, headerShown: false }} />
}

//   {/* <Stack.Screen name="index" />
//   <Stack.Screen name="[username]" />
//   <Stack.Screen name="account" />
//   <Stack.Screen name="lists" />
//   <Stack.Screen name="new-spot" options={{ presentation: "modal" }} />
//   <Stack.Screen name="spot" />
//   <Stack.Screen name="spots" />
//   <Stack.Screen name="guides" /> */}
// // </Stack>
