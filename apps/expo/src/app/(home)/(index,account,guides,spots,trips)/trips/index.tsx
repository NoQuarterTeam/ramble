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
import { api } from "~/lib/api"
import { isTablet } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"
import { useBackgroundColor } from "~/lib/tailwind"

import { useRouter } from "expo-router"
import { PlusCircle } from "lucide-react-native"
import { useFeedbackActivity } from "~/components/FeedbackCheck"
import { Icon } from "~/components/Icon"
import { Text } from "~/components/ui/Text"

export default function TripsLayout() {
  const increment = useFeedbackActivity((s) => s.increment)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === "dark"
  const backgroundColor = useBackgroundColor()
  return (
    <Tabs.Container
      allowHeaderOverscroll={false}
      headerHeight={insets.top + 56}
      headerContainerStyle={{ backgroundColor, shadowRadius: 0 }}
      renderHeader={() => (
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
      )}
      renderTabBar={(tabProps) => (
        <MaterialTabBar
          activeColor={isDark ? "white" : "black"}
          labelStyle={{ fontFamily: "urbanist600" }}
          inactiveColor={isDark ? "white" : "black"}
          indicatorStyle={{ backgroundColor: colors.primary.DEFAULT }}
          {...tabProps}
        />
      )}
    >
      <Tabs.Tab name="Upcoming">
        <UpcomingTrips />
      </Tabs.Tab>
      <Tabs.Tab name="Complete">
        <Tabs.ScrollView>
          <CompleteTrips />
        </Tabs.ScrollView>
      </Tabs.Tab>
    </Tabs.Container>
  )
}

export function UpcomingTrips() {
  const { me } = useMe()
  const { data: trips, isLoading } = api.trip.mine.useQuery(undefined, { enabled: !!me })

  if (!me) return <LoginPlaceholder text="Log in to create a trip" />
  if (isLoading)
    <View className="flex items-center justify-center p-4">
      <Spinner />
    </View>
  return (
    <Tabs.FlashList
      className="flex-1"
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

export function CompleteTrips() {
  console.log("wow")
  return (
    <View>
      <Text>Complete</Text>
    </View>
  )
}
