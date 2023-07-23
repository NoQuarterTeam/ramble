import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { PlusCircle } from "lucide-react-native"

import { SpotItem } from "../../../components/SpotItem"
import { Spinner } from "../../../components/ui/Spinner"
import { TabView } from "../../../components/ui/TabView"
import { Text } from "../../../components/ui/Text"
import { api } from "../../../lib/api"
import { useRouter } from "../../router"

export function LatestScreen() {
  const { push } = useRouter()
  const { data: initialSpots, isLoading } = api.spot.latest.useQuery({ skip: 0 })

  const [spots, setSpots] = React.useState(initialSpots)

  React.useEffect(() => {
    setSpots(initialSpots)
  }, [initialSpots])

  const utils = api.useContext()

  const handleLoadMore = React.useCallback(async () => {
    const newSpots = await utils.spot.latest.fetch({ skip: spots?.length || 0 })
    setSpots([...(spots || []), ...newSpots])
  }, [spots])

  return (
    <TabView
      title="Latest"
      rightElement={
        <TouchableOpacity onPress={() => push("NewSpotLayout")}>
          <PlusCircle className="text-black dark:text-white" />
        </TouchableOpacity>
      }
    >
      {isLoading ? (
        <View className="flex items-center justify-center pt-16">
          <Spinner />
        </View>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={100}
          onEndReachedThreshold={0.8}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text>No spots yet</Text>}
          onEndReached={handleLoadMore}
          data={spots}
          ItemSeparatorComponent={() => <View className="h-1" />}
          renderItem={({ item }) => <SpotItem spot={item} />}
        />
      )}
    </TabView>
  )
}
