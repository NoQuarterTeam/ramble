import { TouchableOpacity, View } from "react-native"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { TripItem } from "~/components/TripItem"
import { Button } from "~/components/ui/Button"
import { Spinner } from "~/components/ui/Spinner"
import { api } from "~/lib/api"
import { isTablet } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"

import { FlashList } from "@shopify/flash-list"
import { useRouter } from "expo-router"
import { PlusCircle } from "lucide-react-native"
import { useFeedbackActivity } from "~/components/FeedbackCheck"
import { Icon } from "~/components/Icon"
import { TabView } from "~/components/ui/TabView"

export default function TripsLayout() {
  const increment = useFeedbackActivity((s) => s.increment)
  const router = useRouter()
  const { me } = useMe()

  const { data: activeTrip, isLoading: activeLoading } = api.trip.active.useQuery(undefined, { enabled: !!me })
  const { data, isLoading } = api.trip.mine.useQuery(undefined, { enabled: !!me })

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
      {isLoading || activeLoading ? (
        <Spinner />
      ) : !data ? null : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={86}
          numColumns={isTablet ? 2 : undefined}
          ListEmptyComponent={
            <View className="space-y-4">
              {/* <Text className="text-center">Have a trip coming up? Then starting adding spots to make a plan.</Text>
              <Text className="text-center">
                Just finished a trip? Add the spots and locations to keep a diary of where you've been!
              </Text> */}
              <Button onPress={() => router.push("/(home)/(trips)/trips/new")}>Create a trip</Button>
            </View>
          }
          ListHeaderComponent={activeTrip ? <TripItem isActive trip={activeTrip} /> : null}
          ListHeaderComponentStyle={{ paddingBottom: 16 }}
          data={data.filter((t) => t.id !== activeTrip?.id)}
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <View style={{ width: "100%", paddingHorizontal: isTablet ? 10 : 0 }}>
              <TripItem trip={item} />
            </View>
          )}
        />
      )}
    </TabView>
  )
}
