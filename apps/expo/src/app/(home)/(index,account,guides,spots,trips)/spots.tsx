import { FlashList } from "@shopify/flash-list"
import { useRouter } from "expo-router"
import { ChevronDown, PlusCircle } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import * as DropdownMenu from "zeego/dropdown-menu"

import type { SpotListSort } from "@ramble/shared"

import { useFeedbackActivity } from "~/components/FeedbackCheck"
import { Icon } from "~/components/Icon"
import { SpotItem } from "~/components/SpotItem"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { Spinner } from "~/components/ui/Spinner"
import { TabView } from "~/components/ui/TabView"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { isTablet } from "~/lib/device"
import { useAsyncStorage } from "~/lib/hooks/useAsyncStorage"
import { useMe } from "~/lib/hooks/useMe"

const SORT_OPTIONS: { [key in SpotListSort]: string } = {
  latest: "Latest",
  rated: "Top rated",
  saved: "Most saved",
  near: "Near me",
} as const

export default function SpotsScreen() {
  const [sort, setSort, isReady] = useAsyncStorage<keyof typeof SORT_OPTIONS>("ramble.spots.sort", "latest")
  const router = useRouter()
  const { data: initialSpots, isLoading } = api.spot.list.useQuery({ skip: 0, sort }, { enabled: isReady })
  const posthog = usePostHog()
  const [spots, setSpots] = React.useState(initialSpots)
  const { me } = useMe()
  React.useEffect(() => {
    setSpots(initialSpots)
  }, [initialSpots])

  const increment = useFeedbackActivity((s) => s.increment)
  const utils = api.useUtils()

  const handleLoadMore = React.useCallback(async () => {
    const newSpots = await utils.spot.list.fetch({ skip: spots?.length || 0, sort })
    setSpots([...(spots || []), ...newSpots])
  }, [spots, utils.spot.list, sort])

  return (
    <TabView
      title={
        isReady ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <TouchableOpacity className="flex flex-row items-center">
                <BrandHeading className="py-2 text-4xl">{SORT_OPTIONS[sort].toLowerCase()}</BrandHeading>
                <Icon icon={ChevronDown} size={20} color="primary" />
              </TouchableOpacity>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {Object.entries(SORT_OPTIONS)
                .filter(([key]) => (key === "near" ? !!me?.latitude && !!me?.longitude : true))
                .map(([key, label]) => (
                  <DropdownMenu.Item
                    onSelect={() => {
                      increment()
                      posthog.capture("spots list sorted", { sort: label })
                      setSort(key as keyof typeof SORT_OPTIONS)
                    }}
                    key={key}
                  >
                    {label}
                  </DropdownMenu.Item>
                ))}
              <DropdownMenu.Arrow />
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : (
          <BrandHeading className="py-2 text-4xl"> </BrandHeading>
        )
      }
      rightElement={
        <TouchableOpacity
          onPress={() => {
            router.push("/new/")
            increment()
          }}
        >
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
    </TabView>
  )
}
