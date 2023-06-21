import type * as React from "react"
import { ScrollView, View } from "react-native"

import { useRouter } from "../app/router"
import { Button } from "./Button"
import { Heading } from "./Heading"
import { Text } from "./Text"

interface Props {
  title: string
  text: string
  children?: React.ReactNode
}

export function LoginPlaceholder(props: Props) {
  const { push } = useRouter()
  return (
    <ScrollView className="h-full">
      <View className="space-y-4 px-4 pt-20">
        <View className="space-y-6 ">
          <View>
            <Heading className="text-3xl">{props.title}</Heading>
            <Text className="text-lg">{props.text}</Text>
          </View>
          <View>
            <Button onPress={() => push("AuthLayout")}>Login</Button>
          </View>
        </View>
        <View>{props.children}</View>
      </View>
    </ScrollView>
  )
}
