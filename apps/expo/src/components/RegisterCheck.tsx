import { useRouter } from "expo-router"
import * as React from "react"

import { useAsyncStorage } from "~/lib/hooks/useAsyncStorage"
import { useMe } from "~/lib/hooks/useMe"

export const REGISTER_CHECK_KEY = "ramble.register.check"

export const RegisterCheck = React.memo(function _RegisterCheck() {
  const [isChecked, _, isReady] = useAsyncStorage(REGISTER_CHECK_KEY, false)
  const { me, isLoading } = useMe()
  const router = useRouter()
  React.useEffect(() => {
    if (isLoading || !isReady) return
    if (!me && !isChecked) router.push("/register")
  }, [me, isLoading, isChecked, isReady, router.push])

  return null
})
