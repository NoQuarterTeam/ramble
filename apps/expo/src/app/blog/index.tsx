import * as React from "react"
import { Linking, View } from "react-native"

export default function Blog() {
  React.useEffect(() => {
    Linking.openURL("https://ramble.guide/blog")
  }, [])
  return <View className="flex-1" />
}
