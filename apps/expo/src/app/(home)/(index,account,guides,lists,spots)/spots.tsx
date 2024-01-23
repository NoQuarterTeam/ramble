import { FlashList } from "@shopify/flash-list"
import { ChevronDown, PlusCircle } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, useColorScheme, View } from "react-native"

import { join, useDisclosure, type SpotListSort } from "@ramble/shared"

import { useRouter } from "expo-router"
import { Icon } from "~/components/Icon"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { SpotItem } from "~/components/SpotItem"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { Spinner } from "~/components/ui/Spinner"
import { TabView } from "~/components/ui/TabView"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { height, isTablet, width } from "~/lib/device"
import { useAsyncStorage } from "~/lib/hooks/useAsyncStorage"
import { useMe } from "~/lib/hooks/useMe"

const SORT_OPTIONS: { [key in SpotListSort]: string } = {
  latest: "latest",
  rated: "top rated",
  saved: "most saved",
  near: "near me",
} as const

export default function SpotsScreen() {
  const sortProps = useDisclosure()
  const isDark = useColorScheme() === "dark"
  const [sort, setSort, isReady] = useAsyncStorage<keyof typeof SORT_OPTIONS>("ramble.spots.sort", "latest")
  const router = useRouter()
  const { data: initialSpots, isLoading } = api.spot.list.useQuery({ skip: 0, sort }, { enabled: isReady })

  const [spots, setSpots] = React.useState(initialSpots)
  const { me } = useMe()
  React.useEffect(() => {
    setSpots(initialSpots)
  }, [initialSpots])

  const utils = api.useUtils()

  const handleLoadMore = React.useCallback(async () => {
    const newSpots = await utils.spot.list.fetch({ skip: spots?.length || 0, sort })
    setSpots([...(spots || []), ...newSpots])
  }, [spots, utils.spot.list, sort])

  if (!me)
    return (
      <TabView title="latest">
        <LoginPlaceholder text="Log in to view latest spots" />
      </TabView>
    )

  return (
    <TabView
      title={
        isReady ? (
          <TouchableOpacity onPress={sortProps.onOpen} className="flex flex-row items-center">
            <BrandHeading className="py-2 text-4xl">{SORT_OPTIONS[sort]}</BrandHeading>
            <Icon icon={ChevronDown} size={20} color="primary" />
          </TouchableOpacity>
        ) : (
          <BrandHeading className="py-2 text-4xl"> </BrandHeading>
        )
      }
      rightElement={
        <TouchableOpacity onPress={() => router.push(`/new/`)}>
          <Icon icon={PlusCircle} />
        </TouchableOpacity>
      }
    >
      {isLoading ? (
        <View className="flex items-center justify-center p-4">
          <Spinner />
        </View>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={322}
          onEndReachedThreshold={0.8}
          numColumns={isTablet ? 2 : undefined}
          contentContainerStyle={{ paddingVertical: 20 }}
          ListEmptyComponent={<Text>No spots yet</Text>}
          onEndReached={handleLoadMore}
          data={spots}
          ItemSeparatorComponent={() => <View className="h-6" />}
          renderItem={({ item }) => (
            <View style={{ width: "100%", paddingHorizontal: isTablet ? 10 : 0 }}>
              <SpotItem spot={item} />
            </View>
          )}
        />
      )}
      {sortProps.isOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={sortProps.onClose}
          className="absolute inset-0 z-10 px-4 pt-[110px]"
          style={{ width, height }}
        >
          <View
            style={{
              shadowOffset: { width: 0, height: 5 },
              shadowRadius: 10,
              shadowColor: isDark ? "black" : "gray",
              shadowOpacity: isDark ? 0.7 : 0.5,
            }}
            className="bg-background dark:bg-background-dark w-[200px] rounded-sm px-4 py-2"
          >
            {Object.entries(SORT_OPTIONS)
              .filter(([key]) => (key === "near" ? !!me?.latitude && !!me?.longitude : true))
              .map(([key, label]) => (
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
    </TabView>
  )
}
