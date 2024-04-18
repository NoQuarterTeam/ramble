import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { Heart, Route, Star, X } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View, useColorScheme } from "react-native"
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated"

import { displayRating, isPartnerSpot } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { PartnerLink } from "~/components/PartnerLink"
import { SpotTypeBadge } from "~/components/SpotTypeBadge"
import { Button } from "~/components/ui/Button"
import { Spinner } from "~/components/ui/Spinner"
import { SpotImageCarousel } from "~/components/ui/SpotImageCarousel"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { isTablet, width } from "~/lib/device"
import { useBackgroundColor } from "~/lib/tailwind"

import { CreatorCard } from "./CreatorCard"
import { useFeedbackActivity } from "./FeedbackCheck"

export const SpotPreview = React.memo(function _SpotPreview({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: spot, isLoading } = api.spot.mapPreview.useQuery({ id })
  const router = useRouter()

  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const utils = api.useUtils()
  // biome-ignore lint/correctness/useExhaustiveDependencies: dont rerender based on utils
  React.useEffect(() => {
    if (!spot) return
    void utils.spot.detail.prefetch({ id: spot.id })
  }, [spot])

  const weatherData = spot?.weather
  const backgroundColor = useBackgroundColor()
  const increment = useFeedbackActivity((s) => s.increment)
  const handleGoToSpot = () => {
    if (!spot) return
    increment()
    router.push(`/(home)/(index)/spot/${spot.id}`)
  }
  return (
    <Animated.View
      style={{ width: "100%", height: 440, position: "absolute", backgroundColor, bottom: 0, zIndex: 1 }}
      entering={SlideInDown.duration(200)}
      exiting={SlideOutDown.duration(200)}
      className="rounded-t-xs p-4"
    >
      {isLoading ? (
        <View className="flex items-center justify-center p-10">
          <Spinner />
        </View>
      ) : !spot ? (
        <Text>Spot not found</Text>
      ) : (
        <View className="space-y-2">
          <TouchableOpacity onPress={handleGoToSpot} activeOpacity={0.9} className="flex flex-row space-x-4">
            <SpotTypeBadge spot={spot} />
            {weatherData && (
              <View className="flex flex-row items-center">
                <Text>{Math.round(weatherData.temp)}°C</Text>
                <Image
                  style={{ width: 35, height: 35 }}
                  source={{ uri: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png` }}
                />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleGoToSpot} activeOpacity={0.7} className="flex flex-row items-center space-x-2">
            <View className="flex flex-row justify-between w-full items-center">
              <Text numberOfLines={1} className="text-lg leading-6">
                {spot.name}
              </Text>
            </View>
          </TouchableOpacity>
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row items-center space-x-2">
              <View className="flex flex-row flex-wrap items-center space-x-1">
                <Icon icon={Heart} size={16} fill={isDark ? "white" : "black"} />
                <Text className="text-sm">{spot._count.listSpots || 0}</Text>
              </View>
              <View className="flex flex-row items-center space-x-1">
                <Icon icon={Star} size={16} fill={isDark ? "white" : "black"} />
                <Text className="text-sm">{displayRating(spot.rating._avg.rating)}</Text>
              </View>
            </View>

            <View className="flex flex-row space-x-2">
              <Button
                size="xs"
                variant="outline"
                onPress={() => {
                  increment()
                  router.push(`/spot/${spot.id}/save-to-list`)
                }}
                leftIcon={
                  <Icon
                    icon={Heart}
                    size={14}
                    fill={spot.listSpots && spot.listSpots.length > 0 ? (isDark ? "white" : "black") : undefined}
                  />
                }
              >
                Save
              </Button>
              <Button
                size="xs"
                variant="outline"
                onPress={() => {
                  increment()
                  router.push(`/spot/${spot.id}/save-to-trip`)
                }}
                leftIcon={
                  <Icon
                    icon={Route}
                    size={14}
                    // fill={spot.listSpots && spot.listSpots.length > 0 ? (isDark ? "white" : "black") : undefined}
                  />
                }
              >
                Add to Trip
              </Button>
            </View>
          </View>

          <View className="overflow-hidden rounded-xs">
            <SpotImageCarousel
              canAddMore={!isPartnerSpot(spot)}
              onPress={handleGoToSpot}
              key={spot.id} // so images reload
              spot={spot}
              width={width - 32}
              height={235}
              noOfColumns={isTablet ? 2 : 1}
              images={spot.images}
            />
          </View>
          <View>{isPartnerSpot(spot) ? <PartnerLink spot={spot} /> : <CreatorCard spot={spot} />}</View>
        </View>
      )}

      <TouchableOpacity onPress={onClose} className="absolute top-2 right-2 flex items-center justify-center p-2">
        <X size={24} color={colorScheme === "dark" ? "white" : "black"} />
      </TouchableOpacity>
    </Animated.View>
  )
})
