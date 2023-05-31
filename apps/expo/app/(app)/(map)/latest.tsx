import { useRouter } from "expo-router"
import { Map } from "lucide-react-native"

import { ScrollView, TouchableOpacity, View } from "react-native"

import { Heading } from "../../../components/Heading"
import { SpotItem } from "../../../components/SpotItem"
import { Text } from "../../../components/Text"
import { api } from "../../../lib/api"

export default function Latest() {
  const router = useRouter()
  const { data: spots } = api.spot.latest.useQuery()

  return (
    <View>
      <ScrollView className="min-h-full px-4 pt-20" contentContainerStyle={{ paddingBottom: 120 }}>
        <Heading className="mb-4 text-4xl">Latest</Heading>
        {spots?.map((spot) => (
          <SpotItem key={spot.id} spot={spot} />
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
