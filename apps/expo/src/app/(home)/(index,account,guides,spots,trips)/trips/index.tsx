import { FlashList } from "@shopify/flash-list"
import { router } from "expo-router"
import { PlusCircle } from "lucide-react-native"
import { TouchableOpacity, View } from "react-native"
import { useFeedbackActivity } from "~/components/FeedbackCheck"
import { Icon } from "~/components/Icon"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { TripItem } from "~/components/TripItem"
import { Spinner } from "~/components/ui/Spinner"
import { TabView } from "~/components/ui/TabView"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { isTablet } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"

export default function TripsScreen() {
  const { me } = useMe()
  const { data: trips, isLoading } = api.trip.mine.useQuery(undefined, { enabled: !!me })
  const increment = useFeedbackActivity((s) => s.increment)
  if (!me)
    return (
      <TabView title="trips">
        <LoginPlaceholder text="Log in to create a trip" />
      </TabView>
    )
  return (
    <TabView
      title="trips"
      rightElement={
        <TouchableOpacity
          onPress={() => {
            increment()
            router.push("/(home)/(trips)/trips/new")
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
        <>
          <FlashList
            showsVerticalScrollIndicator={false}
            estimatedItemSize={86}
            numColumns={isTablet ? 2 : undefined}
            ListEmptyComponent={<Text className="text-center">No trips yet</Text>}
            data={trips}
            ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
            renderItem={({ item }) => (
              <View style={{ width: "100%", paddingHorizontal: isTablet ? 10 : 0 }}>
                <TripItem trip={item} />
              </View>
            )}
          />
        </>
      )}
    </TabView>
  )
}
