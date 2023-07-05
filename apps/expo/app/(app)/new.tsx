import { View } from "react-native"

import { LoginPlaceholder } from "../../components/LoginPlaceholder"
import { Heading } from "../../components/ui/Heading"
import { Text } from "../../components/ui/Text"
import { useMe } from "../../lib/hooks/useMe"

export function NewSpotScreen() {
  const { me } = useMe()
  if (!me) return <LoginPlaceholder title="New spot" text="Log in to start creating spots" />
  return (
    <View className="h-full">
      <View className="space-y-6 px-4 pt-16">
        <View>
          <Heading className="text-3xl">New spot</Heading>
        </View>

        <Text></Text>
      </View>
    </View>
  )
}
