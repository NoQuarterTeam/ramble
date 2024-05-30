import { Redirect } from "expo-router"
import * as React from "react"
import { Linking } from "react-native"

export default function Blog() {
  React.useEffect(() => {
    Linking.openURL("https://ramble.guide/blog")
  }, [])
  return <Redirect href="/" />
}
