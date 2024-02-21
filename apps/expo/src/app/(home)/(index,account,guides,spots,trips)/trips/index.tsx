import { ScrollView, TouchableOpacity, View } from "react-native"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { TripItem } from "~/components/TripItem"
import { Spinner } from "~/components/ui/Spinner"
import { RouterOutputs, api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"

import { useRouter } from "expo-router"
import { Plus, PlusCircle } from "lucide-react-native"
import { useFeedbackActivity } from "~/components/FeedbackCheck"
import { Icon } from "~/components/Icon"
import { TabView } from "~/components/ui/TabView"
import { Text } from "~/components/ui/Text"
import { LinkButton } from "~/components/LinkButton"
import dayjs from "dayjs"

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

  const groupedTrips = !!!activeLoading
    ? data?.reduce<{ upcoming: RouterOutputs["trip"]["mine"]; complete: RouterOutputs["trip"]["mine"] }>(
        (acc, trip) => {
          if (trip.id === activeTrip?.id) return acc
          // group into upcoming and past trips
          const key = trip.startDate > new Date() ? "upcoming" : "complete"
          if (!acc[key]) acc[key] = []
          acc[key].push(trip)

          return acc
        },
        { upcoming: [], complete: [] },
      )
    : undefined

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
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="space-y-2">
            {activeTrip && <TripItem trip={activeTrip} />}
            {groupedTrips?.upcoming && groupedTrips.upcoming.length > 0 && (
              <View className="space-y-2">
                <View className="relative flex items-center justify-center">
                  <View className="absolute h-px w-full bg-gray-200 dark:bg-gray-700" />
                  <View className="bg-background dark:bg-background-dark px-2">
                    <Text className="text-xxs text-center">UPCOMING</Text>
                  </View>
                </View>
                {groupedTrips.upcoming
                  .sort((a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix())
                  .map((trip) => (
                    <View key={trip.id}>
                      <TripItem trip={trip} />
                    </View>
                  ))}
              </View>
            )}
            {groupedTrips?.complete && groupedTrips.complete.length > 0 && (
              <View className="space-y-2">
                <View className="relative flex items-center justify-center">
                  <View className="absolute h-px w-full bg-gray-200 dark:bg-gray-700" />
                  <View className="bg-background dark:bg-background-dark px-2">
                    <Text className="text-xxs text-center">COMPLETE</Text>
                  </View>
                </View>
                {groupedTrips.complete.map((trip) => (
                  <View key={trip.id}>
                    <TripItem trip={trip} />
                  </View>
                ))}
              </View>
            )}
            <View>
              <LinkButton
                leftIcon={<Icon icon={Plus} size={18} color={{ dark: "black", light: "white" }} />}
                href="/(home)/(trips)/trips/new"
              >
                Add a current, upcoming or past trip
              </LinkButton>
            </View>
          </View>
        </ScrollView>
      )}
    </TabView>
  )
}
