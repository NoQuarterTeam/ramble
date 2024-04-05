import * as SplashScreen from "expo-splash-screen"
import * as React from "react"
import { Linking, View } from "react-native"
import { isAndroid } from "~/lib/device"
import { BrandHeading } from "./ui/BrandHeading"
import { Button } from "./ui/Button"
import { Text } from "./ui/Text"

export function UnsupportedVersion() {
  React.useEffect(() => {
    SplashScreen.hideAsync()
  }, [])
  return (
    <View className="flex flex-1 items-center justify-center space-y-2 bg-background p-6 dark:bg-background-dark">
      <BrandHeading className="text-4xl">ramble</BrandHeading>
      <Text className="pb-2 text-center text-xl">
        You are using an outdated version of Ramble. Please update to the latest version to get the best experience.
      </Text>
      <Button
        onPress={() =>
          Linking.openURL(
            isAndroid
              ? "https://play.google.com/store/apps/details?id=co.noquarter.ramble"
              : "https://apps.apple.com/app/ramble-van-travel-app/id6468265289?l=en-GB",
          )
        }
      >
        Update now
      </Button>
    </View>
  )
}
