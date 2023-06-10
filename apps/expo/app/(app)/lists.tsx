import { View } from "react-native"
import { Heading } from "../../components/Heading"
import { useMe } from "../../lib/hooks/useMe"
import { Text } from "../../components/Text"

import { LoginPlaceholder } from "../../components/LoginPlaceholder"

export default function Lists() {
  const { me } = useMe()
  if (!me) return <LoginPlaceholder title="Lists" text="Log in to start saving spots" />
  return (
    <View className="h-full">
      <View className="px-4 pt-20">
        <View>
          <Heading className="text-3xl">Lists</Heading>
        </View>

        <Text>stuff</Text>
      </View>
    </View>
  )
}
