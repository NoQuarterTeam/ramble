import * as React from "react"
import { TouchableOpacity, useColorScheme, View } from "react-native"
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated"
import { Flag, Heart, Star, X } from "lucide-react-native"

import { displayRating, isPartnerSpot } from "@ramble/shared"

import { Icon } from "../../../components/Icon"
import { PartnerLink } from "../../../components/PartnerLink"
import { SpotTypeBadge } from "../../../components/SpotTypeBadge"
import { Button } from "../../../components/ui/Button"
import { Spinner } from "../../../components/ui/Spinner"
import { SpotImageCarousel } from "../../../components/ui/SpotImageCarousel"
import { Text } from "../../../components/ui/Text"
import { VerifiedCard } from "../../../components/VerifiedCard"
import { api } from "../../../lib/api"
import { isTablet, width } from "../../../lib/device"
import { useBackgroundColor } from "../../../lib/tailwind"
import { useRouter } from "../../router"

const cardHeight = 470
export function SpotPreview({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: spot, isLoading } = api.spot.mapPreview.useQuery({ id })
  const { push, navigate } = useRouter()

  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const utils = api.useUtils()
  React.useEffect(() => {
    if (!spot) return
    void utils.spot.detail.prefetch({ id: spot.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot])

  const backgroundColor = useBackgroundColor()

  return (
    <Animated.View
      style={{ height: cardHeight, width: "100%", position: "absolute", backgroundColor, bottom: 0, zIndex: 1 }}
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
        <View>
          <View className="space-y-2">
            <TouchableOpacity onPress={() => push("SpotDetailScreen", { id: spot.id })} activeOpacity={0.9}>
              <SpotTypeBadge spot={spot} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => push("SpotDetailScreen", { id: spot.id })}
              activeOpacity={0.7}
              className="flex flex-row items-center space-x-2"
            >
              <Text numberOfLines={1} className="text-lg leading-6">
                {spot.name}
              </Text>
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

              <View className="rounded-xs overflow-hidden">
                <SpotImageCarousel
                  canAddMore
                  onPress={() => push("SpotDetailScreen", { id: spot.id })}
                  key={spot.id} // so images reload
                  spotId={spot.id}
                  width={width - 32}
                  height={235}
                  noOfColumns={isTablet ? 2 : 1}
                  images={spot.images}
                />
              </View>
              <View>{isPartnerSpot(spot) ? <PartnerLink spot={spot} /> : <VerifiedCard spot={spot} />}</View>
            </View>
            <View>
              <Button
                variant="link"
                leftIcon={<Icon icon={Flag} size={16} />}
                onPress={() => navigate("SpotReportScreen", { id: spot.id })}
              >
                Report incorrect data
              </Button>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity onPress={onClose} className="absolute right-2 top-2 flex items-center justify-center p-2">
        <X size={24} color={colorScheme === "dark" ? "white" : "black"} />
      </TouchableOpacity>
    </Animated.View>
  )
}
