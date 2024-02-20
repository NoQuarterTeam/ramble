import colors from "@ramble/tailwind-config/src/colors"
import { router } from "expo-router"
import { TouchableOpacity, View, useColorScheme } from "react-native"
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { TripItem } from "~/components/TripItem"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { Button } from "~/components/ui/Button"
import { Spinner } from "~/components/ui/Spinner"
import { RouterOutputs, api } from "~/lib/api"
import { isTablet } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"
import { useBackgroundColor } from "~/lib/tailwind"

import { useRouter } from "expo-router"
import { PlusCircle } from "lucide-react-native"
import { useFeedbackActivity } from "~/components/FeedbackCheck"
import { Icon } from "~/components/Icon"

function Header() {
  const increment = useFeedbackActivity((s) => s.increment)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  return (
    <View style={{ paddingTop: insets.top }} className="flex flex-row items-center justify-between px-4">
      <View className="flex flex-row items-center space-x-0.5">
        <BrandHeading className="py-2 text-4xl">trips</BrandHeading>
      </View>
      <TouchableOpacity
        onPress={() => {
          increment()
          router.push("/(home)/(trips)/trips/new")
        }}
      >
        <Icon icon={PlusCircle} />
      </TouchableOpacity>
    </View>
  )
}
export default function TripsLayout() {
  const insets = useSafeAreaInsets()
  const { me } = useMe()
  const isDark = useColorScheme() === "dark"
  const backgroundColor = useBackgroundColor()
  const { data, isLoading } = api.trip.active.useQuery(undefined, { enabled: !!me })

  if (isLoading) return <Header />
  return (
    <Tabs.Container
      allowHeaderOverscroll={false}
      headerHeight={insets.top + 56}
      headerContainerStyle={{
        backgroundColor,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 1 },
        shadowColor: colors.gray[isDark ? "600" : "400"],
      }}
      renderHeader={Header}
      renderTabBar={(tabProps) => (
        <MaterialTabBar
          {...tabProps}
          activeColor={isDark ? "white" : "black"}
          labelStyle={{ fontFamily: "urbanist600" }}
          inactiveColor={isDark ? "white" : "black"}
          indicatorStyle={{ backgroundColor: colors.primary.DEFAULT }}
        />
      )}
    >
      {data && data.length > 0 ? (
        <Tabs.Tab name="Active">
          <TripsList trips={data} />
        </Tabs.Tab>
      ) : null}
      <Tabs.Tab name="Upcoming">
        <UpcomingTrips />
      </Tabs.Tab>
      <Tabs.Tab name="Complete">
        <CompleteTrips />
      </Tabs.Tab>
    </Tabs.Container>
  )
}

export function UpcomingTrips() {
  const { me } = useMe()
  const { data, isLoading } = api.trip.upcoming.useQuery(undefined, { enabled: !!me })

  if (!me) return <LoginPlaceholder text="Log in to create a trip" />
  if (isLoading)
    <View className="flex items-center justify-center p-4">
      <Spinner />
    </View>
  if (!data) return null
  return <TripsList trips={data} />
}

export function CompleteTrips() {
  const { me } = useMe()
  const { data, isLoading } = api.trip.complete.useQuery(undefined, { enabled: !!me })

  if (!me) return <LoginPlaceholder text="Log in to create a trip" />
  if (isLoading)
    <View className="flex items-center justify-center p-4">
      <Spinner />
    </View>
  if (!data) return null
  return <TripsList trips={data} />
}

function TripsList({ trips }: { trips: RouterOutputs["trip"]["upcoming"] | RouterOutputs["trip"]["complete"] }) {
  return (
    <Tabs.FlashList
      contentContainerStyle={{ padding: 16 }}
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
      data={trips}
      ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      renderItem={({ item }) => (
        <View style={{ width: "100%", paddingHorizontal: isTablet ? 10 : 0 }}>
          <TripItem trip={item} />
        </View>
      )}
    />
  )
}
