import { useRouter } from "expo-router"
import { View } from "react-native"
import { Button } from "~/components/ui/Button"
import { Text } from "~/components/ui/Text"

export default function NotFound() {
  const router = useRouter()
  return (
    <View className="space-y-2">
      <Text>Not Found</Text>
      <Button onPress={() => router.navigate("/")}>Take me back</Button>
    </View>
  )
}
