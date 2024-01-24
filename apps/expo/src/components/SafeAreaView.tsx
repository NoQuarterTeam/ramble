import type * as React from "react"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface Props {
  children: React.ReactNode
}

export function SafeAreaView(props: Props) {
  const insets = useSafeAreaInsets()
  return <View style={{ paddingTop: insets.top, flex: 1 }} {...props} />
}
