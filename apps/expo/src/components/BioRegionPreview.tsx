import { BIOREGIONS, type BioRegion, createAssetUrl } from "@ramble/shared"
import * as Sentry from "@sentry/react-native"
import { Image } from "expo-image"
import * as WebBrowser from "expo-web-browser"
import { Earth, X } from "lucide-react-native"
import * as React from "react"
import { Linking, TouchableOpacity, View, useColorScheme } from "react-native"
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated"
import { Text } from "~/components/ui/Text"
import { FULL_WEB_URL } from "~/lib/config"
import { width } from "~/lib/device"
import { useBackgroundColor } from "~/lib/tailwind"
import { Icon } from "./Icon"
import { OptimizedImage } from "./ui/OptimisedImage"

export const BioRegionPreview = React.memo(function _BioRegionPreview({ id, onClose }: { id: BioRegion; onClose: () => void }) {
  const bioRegion = BIOREGIONS[id]

  const isDark = useColorScheme() === "dark"

  const backgroundColor = useBackgroundColor()

  const handleGoToBioRegion = async () => {
    if (!bioRegion) return
    try {
      await WebBrowser.openBrowserAsync(bioRegion.url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      })
    } catch (e) {
      Sentry.captureException(e)
      Linking.openURL(bioRegion.url)
    }
  }

  const image = bioRegion?.imageUrl ? { path: bioRegion.imageUrl, blurHash: "" } : { path: "", blurHash: "" }

  return (
    <Animated.View
      style={{ width: "100%", position: "absolute", backgroundColor, bottom: 0, zIndex: 1 }}
      entering={SlideInDown.duration(200)}
      exiting={SlideOutDown.duration(200)}
      className="rounded-t-sm p-4"
    >
      {!bioRegion ? (
        <Text>Bio region not found</Text>
      ) : (
        <View className="space-y-2">
          <View className="flex flex-row justify-between">
            <View className="flex flex-row items-center space-x-1 rounded-full border border-gray-200 px-3 py-1.5 dark:border-gray-600">
              <Icon icon={Earth} size={16} />
              <Text className="text-xs">Bio region</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="flex items-center justify-center p-1">
              <Icon icon={X} size={22} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleGoToBioRegion} activeOpacity={0.7} className="flex flex-row items-center space-x-2">
            <View className="flex flex-row justify-between w-full items-center">
              <Text numberOfLines={1} className="text-lg leading-6">
                {bioRegion.name}
              </Text>
            </View>
          </TouchableOpacity>
          <View className="overflow-hidden rounded-xs">
            <TouchableOpacity onPress={handleGoToBioRegion} activeOpacity={1}>
              <OptimizedImage
                width={width - 32}
                height={235}
                placeholder={image.blurHash}
                source={{ uri: createAssetUrl(image.path) }}
                style={{ width: width - 32, height: 235, marginHorizontal: 0 }}
                className="rounded-xs object-cover"
              />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              onPress={handleGoToBioRegion}
              className="flex flex-row items-center justify-between rounded-xs border border-gray-200 p-2 px-3 dark:border-gray-700/70"
            >
              <Text className="text-base">Provided by</Text>
              <Image
                contentFit="contain"
                className="h-[40px] w-[120px] bg-right object-contain"
                source={{ uri: `${FULL_WEB_URL}/partners/one-earth${isDark ? "-dark" : ""}.png` }}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  )
})
