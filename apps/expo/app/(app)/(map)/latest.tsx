import { ScrollView, TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import { Map } from "lucide-react-native"

import { Heading } from "../../../components/Heading"
import { Text } from "../../../components/Text"
import { api } from "../../../lib/api"

export default function Latest() {
  const router = useRouter()
  const { data } = api.spot.latest.useQuery()
  return (
    <View className="flex-1">
      <ScrollView className="h-full px-4 pt-20">
        <Heading className="text-4xl">Latest</Heading>
        {data?.map((spot) => (
          <Text key={spot.id}>{spot.name}</Text>
        ))}
      </ScrollView>
      <TouchableOpacity
        onPress={() => router.push("(map)")}
        className="absolute bottom-3 left-1/2 -ml-[50px] flex w-[100px] flex-row items-center justify-center space-x-2 rounded-full bg-gray-800 p-3 dark:bg-white"
      >
        <Map size={20} className="text-white dark:text-black" />
        <Text className="text-white dark:text-black">Map</Text>
      </TouchableOpacity>
    </View>
  )
}
