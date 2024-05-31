import { useRouter } from "expo-router"
import type * as React from "react"
import { ScrollView, View } from "react-native"
import { Button } from "./ui/Button"
import { Text } from "./ui/Text"

interface Props {
  text: string
  children?: React.ReactNode
}

export function SignupCta(props: Props) {
  const router = useRouter()
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="space-y-4">
        <View className="space-y-6">
          <Text className="text-lg">{props.text}</Text>
          <View>
            <Button onPress={() => router.push("/register")}>Sign up</Button>
          </View>
          <Button variant="link" onPress={() => router.push("/login")}>
            Already signed up? Login
          </Button>
        </View>
        <View>{props.children}</View>
      </View>
    </ScrollView>
  )
}
