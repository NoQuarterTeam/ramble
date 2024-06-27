import dayjs from "dayjs"
import { useRouter } from "expo-router"
import { Plus, PlusCircle } from "lucide-react-native"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { CtaCarousel } from "~/components/CtaCarousel"

import { useFeedbackActivity } from "~/components/FeedbackCheck"
import { Icon } from "~/components/Icon"
import { LinkButton } from "~/components/LinkButton"
import { TripItem } from "~/components/TripItem"
import { Button } from "~/components/ui/Button"
import { Spinner } from "~/components/ui/Spinner"
import { TabView } from "~/components/ui/TabView"
import { Text } from "~/components/ui/Text"
import { type RouterOutputs, api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"

export default function TripsLayout() {
  const increment = useFeedbackActivity((s) => s.increment)
  const router = useRouter()
  const { me } = useMe()

  const { data, isLoading } = api.trip.mine.useQuery(undefined, { enabled: !!me })

  const carouselItems = [
    { text: "Plan upcoming trips or add a travel log of your past trips", image: require("assets/trips-slide-1.png") },
    { text: "Share with your travel companions", image: require("assets/trips-slide-2.png") },
    { text: "Enjoy reliving memories with auto sync'd photos", image: require("assets/trips-slide-3.png") },
  ]

  if (!me)
    return (
      <TabView
        title="trips"
        rightElement={
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Icon icon={PlusCircle} />
          </TouchableOpacity>
        }
      >
        <View className="pt-10">
          <CtaCarousel items={carouselItems} />
          <View className="px-8">
            <Button onPress={() => router.push("/register")}>Sign up</Button>
            <Button variant="link" onPress={() => router.push("/login")}>
              Already signed up? Login
            </Button>
          </View>
        </View>
      </TabView>
    )

  const groupedTrips = data?.reduce<{ upcoming: RouterOutputs["trip"]["mine"]; complete: RouterOutputs["trip"]["mine"] }>(
    (acc, trip) => {
      // skip active trip
      if (trip.startDate < new Date() && trip.endDate > new Date()) return acc
      // group into upcoming and past trips
      const key = trip.startDate > new Date() ? "upcoming" : "complete"
      if (!acc[key]) acc[key] = []
      acc[key].push(trip)

      return acc
    },
    { upcoming: [], complete: [] },
  )

  const activeTrip = data?.find((trip) => dayjs().isBetween(trip.startDate, trip.endDate))

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
        <Spinner />
      ) : !data ? null : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="space-y-2">
            {activeTrip && <TripItem trip={activeTrip} />}
            {groupedTrips?.upcoming && groupedTrips.upcoming.length > 0 && (
              <View className="space-y-2">
                <View className="relative flex items-center justify-center">
                  <View className="absolute h-px w-full bg-gray-200 dark:bg-gray-700" />
                  <View className="bg-background px-2 dark:bg-background-dark">
                    <Text className="text-center text-xxs">UPCOMING</Text>
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
                  <View className="bg-background px-2 dark:bg-background-dark">
                    <Text className="text-center text-xxs">COMPLETE</Text>
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
