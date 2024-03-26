import * as React from "react"
import { Platform } from "react-native"
import Purchases, { type CustomerInfo } from "react-native-purchases"
import { revenueCatKey } from "../revenue-cat"
import { useMe } from "./useMe"

export function useCustomer() {
  const { me } = useMe()
  const [isLoading, setIsLoading] = React.useState(true)
  const [customer, setCustomer] = React.useState<CustomerInfo & { isSubscribed: boolean }>()
  const load = React.useCallback(async () => {
    try {
      if (!me) return
      if (Platform.OS === "ios") {
        await Purchases.configure({ apiKey: revenueCatKey.ios, appUserID: me.id })
      } else if (Platform.OS === "android") {
        await Purchases.configure({ apiKey: revenueCatKey.android, appUserID: me.id })
      }
      const customer = await Purchases.getCustomerInfo()
      setCustomer({ ...customer, isSubscribed: customer.activeSubscriptions.length > 0 })
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }, [me])

  React.useEffect(() => {
    load()
  }, [load])

  return { isLoading, customer }
}
