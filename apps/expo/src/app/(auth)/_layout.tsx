import * as React from "react"

import { Stack } from "expo-router"
import { REGISTER_CHECK_KEY } from "~/components/RegisterCheck"
import { useAsyncStorage } from "~/lib/hooks/useAsyncStorage"

export default function AuthLayout() {
  const [isChecked, setIsChecked, isReady] = useAsyncStorage(REGISTER_CHECK_KEY, false)

  React.useEffect(() => {
    if (!isReady || isChecked) return
    setIsChecked(true)
  }, [isReady, setIsChecked, isChecked])
  return <Stack initialRouteName="login" screenOptions={{ headerShown: false }} />
}
