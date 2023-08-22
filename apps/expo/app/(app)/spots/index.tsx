import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { ChevronDown, PlusCircle } from "lucide-react-native"

import { join, useDisclosure } from "@ramble/shared"

import { SpotItem } from "../../../components/SpotItem"
import { Heading } from "../../../components/ui/Heading"
import { Spinner } from "../../../components/ui/Spinner"
import { TabView } from "../../../components/ui/TabView"
import { Text } from "../../../components/ui/Text"
import { api } from "../../../lib/api"
import { height, width } from "../../../lib/device"
import { useRouter } from "../../router"

const SORT_OPTIONS = { latest: "Latest", rated: "Top rated", saved: "Most saved" } as const
export function SpotsScreen() {
  const sortProps = useDisclosure()
  const [sort, setSort] = React.useState<keyof typeof SORT_OPTIONS>("latest")
  const { push } = useRouter()
  const { data: initialSpots, isLoading } = api.spot.list.useQuery({ skip: 0, sort })

  const [spots, setSpots] = React.useState(initialSpots)

  React.useEffect(() => {
    setSpots(initialSpots)
  }, [initialSpots])

  const utils = api.useContext()

  const handleLoadMore = React.useCallback(async () => {
    const newSpots = await utils.spot.list.fetch({ skip: spots?.length || 0 })
    setSpots([...(spots || []), ...newSpots])
  }, [spots])

  return (
    <TabView
      title={
        <TouchableOpacity onPress={sortProps.onOpen} className="flex flex-row items-center">
          <Heading className="py-2 text-3xl">{SORT_OPTIONS[sort]}</Heading>
          <ChevronDown size={20} className="text-black dark:text-white" />
        </TouchableOpacity>
      }
      rightElement={
        <TouchableOpacity onPress={() => push("NewSpotLayout")}>
          <PlusCircle className="text-black dark:text-white" />
        </TouchableOpacity>
      }
    >
      {sortProps.isOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={sortProps.onClose}
          className="absolute inset-0 z-10 px-4 pt-[110px] shadow-md"
          style={{ width, height }}
        >
          <View className="w-[200px] rounded-md bg-white px-4 py-2">
            {Object.entries(SORT_OPTIONS).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setSort(key as keyof typeof SORT_OPTIONS)
                  sortProps.onClose()
                }}
              >
                <Text className={join("py-2 text-lg", sort === key && "underline")}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
      {isLoading ? (
        <View className="flex items-center justify-center pt-16">
          <Spinner />
        </View>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={322}
          onEndReachedThreshold={0.8}
          contentContainerStyle={{ paddingVertical: 20 }}
          ListEmptyComponent={<Text>No spots yet</Text>}
          onEndReached={handleLoadMore}
          data={spots}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => <SpotItem spot={item} />}
        />
      )}
    </TabView>
  )
}
