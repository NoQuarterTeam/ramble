import type * as React from "react"
import { ScrollView, View } from "react-native"

import { useRouter } from "../app/router"
import { Button } from "./ui/Button"
import { Text } from "./ui/Text"

interface Props {
  text: string
  children?: React.ReactNode
}

export function LoginPlaceholder(props: Props) {
  const { push } = useRouter()
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="space-y-4">
        <View className="space-y-6">
          <Text className="text-lg">{props.text}</Text>
          <View>
            <Button onPress={() => push("AuthLayout")}>Login</Button>
          </View>
        </View>
        <View>{props.children}</View>
      </View>
    </ScrollView>
  )
}
