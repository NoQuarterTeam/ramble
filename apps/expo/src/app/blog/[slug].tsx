import { useLocalSearchParams } from "expo-router"
import * as React from "react"
import { Linking, View } from "react-native"

export default function BlogDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  React.useEffect(() => {
    if (!slug) {
      Linking.openURL("https://ramble.guide/blog")
      return
    }
    Linking.openURL(`https://ramble.guide/blog/${slug}`)
  }, [slug])
  return <View className="flex-1" />
}
