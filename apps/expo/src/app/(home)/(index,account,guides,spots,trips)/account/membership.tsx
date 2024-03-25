import * as React from "react"
import { Platform, ScrollView } from "react-native"

import Purchases, { type PurchasesOfferings } from "react-native-purchases"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
const apiKey = {
  ios: "appl_OBzWftjIqoAJsRRjvxJCQkIyfmE",
  android: "appl_OBzWftjIqoAJsRRjvxJCQkIyfmE",
}

export default function Screen() {
  React.useEffect(() => {
    const init = async () => {
      if (Platform.OS === "ios") {
        await Purchases.configure({ apiKey: apiKey.ios })
      } else if (Platform.OS === "android") {
        await Purchases.configure({ apiKey: apiKey.android })
      }
      getOfferings()
    }
    init()
  }, [])

  const [offerings, setOfferings] = React.useState<PurchasesOfferings>()

  const getOfferings = async () => {
    try {
      const off = await Purchases.getOfferings()
      setOfferings(off)
      console.log(off)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <ScreenView title="membership">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text>Hello</Text>
      </ScrollView>
    </ScreenView>
  )
}
