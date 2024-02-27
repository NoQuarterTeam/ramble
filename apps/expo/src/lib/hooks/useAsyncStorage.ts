import AsyncStorage from "@react-native-async-storage/async-storage"
import * as React from "react"

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [isReady, setIsReady] = React.useState(false)
  const [state, setState] = React.useState<T>(initialValue)

  const getState = React.useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem(key)
      if (value) setState(JSON.parse(value))
    } catch {
    } finally {
      setIsReady(true)
    }
  }, [key])

  const setAsyncState = React.useCallback(
    async (val: T) => {
      try {
        const payload = JSON.stringify(val)
        setState(val)
        await AsyncStorage.setItem(key, payload)
      } catch {}
    },
    [key],
  )

  React.useEffect(() => {
    getState()
  }, [getState])

  return [state, setAsyncState, isReady] as const
}
