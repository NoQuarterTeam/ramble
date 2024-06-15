import { useRouter } from "expo-router"
import { View } from "react-native"
import { SafeAreaView } from "~/components/SafeAreaView"
import { Button } from "~/components/ui/Button"
import { Text } from "~/components/ui/Text"

export default function NotFound() {
  const router = useRouter()
  return (
    <SafeAreaView>
      <View className="space-y-2 flex p-4">
        <Text>Not Found</Text>
        <Button onPress={() => router.navigate("/")}>Take me back</Button>
      </View>
    </SafeAreaView>
  )
}
