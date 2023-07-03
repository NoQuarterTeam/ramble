import * as React from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [isReady, setIsReady] = React.useState(false)
  const [state, setState] = React.useState<T>(initialValue)

  const getState = async () => {
    try {
      const value = await AsyncStorage.getItem(key)
      if (value) setState(JSON.parse(value))
    } catch {
    } finally {
      setIsReady(true)
    }
  }
  const setAsyncState = async (val: T) => {
    try {
      const payload = JSON.stringify(val)
      setState(val)
      await AsyncStorage.setItem(key, payload)
    } catch {}
  }

  React.useEffect(() => {
    getState()
  }, [])

  return [state, setAsyncState, isReady] as const
}
