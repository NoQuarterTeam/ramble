import { View } from "react-native"

import { Heading } from "../../components/Heading"
import { LoginPlaceholder } from "../../components/LoginPlaceholder"
import { useMe } from "../../lib/hooks/useMe"
import { Text } from "../../components/Text"

export default function New() {
  const { me } = useMe()
  if (!me) return <LoginPlaceholder title="New spot" text="Log in to start creating spots" />
  return (
    <View className="h-full">
      <View className="space-y-6 px-4 pt-20">
        <View>
          <Heading className="text-3xl">New spot</Heading>
        </View>

        <Text></Text>
      </View>
    </View>
  )
}
