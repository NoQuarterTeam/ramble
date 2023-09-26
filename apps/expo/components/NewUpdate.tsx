import * as React from "react"
import { View } from "react-native"
import * as Updates from "expo-updates"

import { BrandHeading } from "./ui/BrandHeading"
import { Button } from "./ui/Button"
import { Heading } from "./ui/Heading"
import { Text } from "./ui/Text"

export function NewUpdate() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState(false)
  const handleUpdate = async () => {
    try {
      setIsLoading(true)
      setError(false)
      await Updates.fetchUpdateAsync()
      await Updates.reloadAsync()
    } catch {
      setIsLoading(false)
      setError(true)
    }
  }
  return (
    <View className="bg-background dark:bg-background-dark h-screen w-full items-center space-y-4 px-4 pt-32">
      <BrandHeading className="text-center text-4xl">ramble</BrandHeading>
      <Heading className="text-center text-2xl dark:text-white">New update is available</Heading>
      <Text className="text-center">Don&apos;t miss out on new features, bug fixes and many other improvements!</Text>
      <View className="w-full space-y-2 px-10">
        <Button isLoading={isLoading} size="sm" variant="outline" onPress={handleUpdate}>
          Update now
        </Button>
        {error ? <Text className="text-center text-red-500">Something went wrong, try closing the app and reopening</Text> : null}
      </View>
    </View>
  )
}
