import * as React from "react"
import { TouchableOpacity, useColorScheme, View } from "react-native"
import BottomSheet, { useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet"
import { Heart, Star, X } from "lucide-react-native"

import { displayRating, isPartnerSpot } from "@ramble/shared"

import { PartnerLink } from "../../../components/PartnerLink"
import { SpotIcon } from "../../../components/SpotIcon"
import { Button } from "../../../components/ui/Button"
import { Spinner } from "../../../components/ui/Spinner"
import { SpotImageCarousel } from "../../../components/ui/SpotImageCarousel"
import { Text } from "../../../components/ui/Text"
import { VerifiedCard } from "../../../components/VerifiedCard"
import { api } from "../../../lib/api"
import { height, isTablet, width } from "../../../lib/device"
import { useBackgroundColor } from "../../../lib/tailwind"
import { useRouter } from "../../router"
import { Icon } from "../../../components/Icon"
// import * as Device from 'expo-device';

export const SpotPreview = React.memo(function _SpotPreview({ id, onClose }: { id: string | null; onClose: () => void }) {
  const {
    data: spot,
    isLoading,
    isFetching,
  } = api.spot.mapPreview.useQuery({ id: id || "" }, { enabled: !!id, keepPreviousData: true })
  const { push, navigate } = useRouter()
  const colorScheme = useColorScheme()

  const bottomSheetRef = React.useRef<BottomSheet>(null)

  const handleSheetClose = React.useCallback(() => {
    bottomSheetRef.current?.close()
    onClose()
  }, [onClose])
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 40,
    overshootClamping: true,
    stiffness: 500,
  })

  const isDark = colorScheme === "dark"

  const backgroundColor = useBackgroundColor()

  return (
    <BottomSheet
      animationConfigs={animationConfigs}
      ref={bottomSheetRef}
      handleComponent={null}
      index={id ? 0 : -1}
      onClose={onClose}
      snapPoints={[height * 0.5]}
    >
      <View style={{ backgroundColor }} className="rounded-t-xs h-full p-4">
        {isLoading || (isFetching && id !== spot?.id) ? (
          <View className="flex items-center justify-center p-10">
            <Spinner />
          </View>
        ) : !spot ? (
          <Text>Spot not found</Text>
        ) : (
          <View className="space-y-3">
            <View className="space-y-1">
              <TouchableOpacity
                onPress={() => push("SpotDetailScreen", { id: spot.id })}
                activeOpacity={0.7}
                className="flex h-[50px] flex-row items-center space-x-2"
              >
                <View className="sq-12 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700">
                  <SpotIcon size={20} type={spot.type} />
                </View>
                <Text numberOfLines={2} className="pr-14 text-base leading-6 text-black hover:underline dark:text-white">
                  {spot.name}
                </Text>
              </TouchableOpacity>
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center space-x-2">
                  <View className="flex flex-row items-center space-x-1">
                    <Icon icon={Star} size={16} />
                    <Text className="text-sm">{displayRating(spot.rating._avg.rating)}</Text>
                  </View>
                  <View className="flex flex-row flex-wrap items-center space-x-1">
                    <Icon icon={Heart} size={16} />
                    <Text className="text-sm">{spot._count.listSpots || 0}</Text>
                  </View>
                </View>

                <Button
                  size="xs"
                  variant="outline"
                  onPress={() => navigate("SaveSpotScreen", { id: spot.id })}
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
              </View>
            </View>
            <View className="rounded-xs overflow-hidden">
              <SpotImageCarousel
                canAddMore
                onPress={() => push("SpotDetailScreen", { id: spot.id })}
                key={spot.id} // so images reload
                spotId={spot.id}
                width={width - 32}
                height={height * 0.5 - 190}
                noOfColumns={isTablet ? 2 : 1}
                images={spot.images}
              />
            </View>
            <View>{isPartnerSpot(spot) ? <PartnerLink spot={spot} /> : <VerifiedCard spot={spot} />}</View>
          </View>
        )}

        <TouchableOpacity onPress={handleSheetClose} className="absolute right-2 top-2 flex items-center justify-center p-2">
          <X size={24} color={colorScheme === "dark" ? "white" : "black"} />
        </TouchableOpacity>
      </View>
    </BottomSheet>
  )
})
