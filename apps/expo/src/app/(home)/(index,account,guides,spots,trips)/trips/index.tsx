import { FlashList } from "@shopify/flash-list"
import { router } from "expo-router"
import { PlusCircle } from "lucide-react-native"
import { TouchableOpacity, View } from "react-native"
import { Icon } from "~/components/Icon"
import { TripItem } from "~/components/TripItem"
import { Spinner } from "~/components/ui/Spinner"
import { TabView } from "~/components/ui/TabView"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { isTablet } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"

export default function TripsScreen() {
  const { me } = useMe()
  const { data: trips, isLoading, refetch } = api.user.trips.useQuery(undefined, { enabled: !!me })

  return (
    <TabView
      title="trips"
      rightElement={
        <TouchableOpacity onPress={() => router.push("/(home)/(trips)/trips/new")}>
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
          <TouchableOpacity onPress={() => refetch()}>
            <Text>refetch</Text>
          </TouchableOpacity>
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
