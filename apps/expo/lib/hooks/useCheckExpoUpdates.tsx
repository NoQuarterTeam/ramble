import * as React from "react"
import { AppState, type AppStateStatus } from "react-native"
import * as Updates from "expo-updates"

import { IS_DEV } from "../config"

export function useCheckExpoUpdates() {
  const [isDoneChecking, setIsDoneChecking] = React.useState(false)
  const appState = React.useRef(AppState.currentState)

  const checkForExpoUpdates = async () => {
    try {
      if (IS_DEV) return setIsDoneChecking(true)
      const { isAvailable } = await Updates.checkForUpdateAsync()
      if (isAvailable) {
        await Updates.fetchUpdateAsync()
        await Updates.reloadAsync()
      }
    } catch {
      // do nothing
    } finally {
      return setIsDoneChecking(true)
    }
  }

  const handleAppStateChange = React.useCallback((nextAppState: AppStateStatus) => {
    const isBackground = appState.current === "background"
    if (isBackground && nextAppState === "active") {
      void checkForExpoUpdates()
    } else {
      setIsDoneChecking(true)
    }
    appState.current = nextAppState
  }, [])

  React.useEffect(() => {
    checkForExpoUpdates()
    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => {
      subscription.remove()
    }
  }, [handleAppStateChange])

  return { isDoneChecking }
}
