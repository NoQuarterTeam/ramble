import * as React from "react"
import { TouchableOpacity, useColorScheme, View, type ViewProps } from "react-native"
import { showLocation } from "react-native-map-link"
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"
import RenderHtml, { defaultSystemFonts } from "react-native-render-html"
import * as Location from "expo-location"
import { StatusBar } from "expo-status-bar"
import { ChevronDown, ChevronLeft, Compass, Heart, Star } from "lucide-react-native"

import { AMENITIES, merge } from "@ramble/shared"

import { ReviewItem } from "../../../../../components/ReviewItem"
import { Button } from "../../../../../components/ui/Button"
import { Heading } from "../../../../../components/ui/Heading"
import { ImageCarousel } from "../../../../../components/ui/ImageCarousel"
import { Text } from "../../../../../components/ui/Text"
import { VerifiedCard } from "../../../../../components/VerifiedCard"
import { api } from "../../../../../lib/api"
import { width } from "../../../../../lib/device"
import { useMe } from "../../../../../lib/hooks/useMe"
import { useParams, useRouter } from "../../../../router"

export function SpotDetailScreen() {
  const [location, setLocation] = React.useState<Location.LocationObjectCoords | null>(null)
  const { me } = useMe()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const { params } = useParams<"SpotDetailScreen">()
  const { data, isLoading } = api.spot.detail.useQuery({ id: params.id })
  const spot = data
  const translationY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      translationY.value = event.contentOffset.y
    },
  })
  const navigation = useRouter()

  const topBarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translationY.value, [100, 180], [0, 1], Extrapolation.CLAMP)
    return { opacity }
  })

  React.useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") return
        const loc = await Location.getCurrentPositionAsync()
        setLocation(loc.coords)
      } catch {
        console.log("oops -  getting location")
      }
    })()
  }, [])

  const handleGetDirections = async () => {
    if (!spot) return
    showLocation({
      latitude: spot.latitude,
      longitude: spot.longitude,
      sourceLatitude: location?.latitude,
      sourceLongitude: location?.longitude,
      title: spot.name,
      googleForceLatLon: true,
      alwaysIncludeGoogle: true,
      directionsMode: "car",
    })
  }

  if (isLoading) return <SpotLoading />
  if (!spot)
    return (
      <View className="space-y-2 px-4 pt-16">
        <Text className="text-lg">Spot not found</Text>
        {navigation.canGoBack() && <Button onPress={navigation.goBack}>Back</Button>}
      </View>
    )
  const fonts = ["poppins400", "poppins600", ...defaultSystemFonts]
  return (
    <View>
      <StatusBar animated style={isDark ? "light" : "dark"} />
      <Animated.ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200 }}
        style={{ flexGrow: 1 }}
        onScroll={scrollHandler}
      >
        <ImageCarousel width={width} height={300} images={spot.images} />
        <View className="space-y-3 p-4">
          <View className="space-y-2">
            <Heading className="text-2xl leading-7">{spot.name}</Heading>
            <View className="flex flex-row items-start justify-between">
              <View className="flex flex-row items-center space-x-1">
                <Star size={20} className="text-black dark:text-white" />
                <Text className="text-sm">{spot.rating._avg.rating ? spot.rating._avg.rating?.toFixed(1) : "Not rated"}</Text>
                <Text className="text-sm">·</Text>
                <Text className="text-sm">
                  {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
                </Text>
              </View>
            </View>
          </View>
          <View className="space-y-1">
            <View>
              <VerifiedCard spot={spot} />
            </View>
            <View>
              <RenderHtml
                systemFonts={fonts}
                baseStyle={{ fontSize: 16, fontFamily: "poppins400", color: isDark ? "white" : "black" }}
                contentWidth={width}
                source={{ html: spot.description || "" }}
              />
            </View>

            <Text className="text-sm">{spot.address}</Text>
            {spot.amenities && (
              <View className="flex flex-wrap flex-row gap-2">
                {spot.amenities.toilet && (
                  <View className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Text className="text-sm">{AMENITIES.toilet}</Text>
                  </View>
                )}
                {spot.amenities.shower && (
                  <View className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Text className="text-sm">{AMENITIES.shower}</Text>
                  </View>
                )}
                {spot.amenities.electricity && (
                  <View className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Text className="text-sm">{AMENITIES.electricity}</Text>
                  </View>
                )}
                {spot.amenities.water && (
                  <View className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Text className="text-sm">{AMENITIES.water}</Text>
                  </View>
                )}
                {spot.amenities.hotWater && (
                  <View className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Text className="text-sm">{AMENITIES.hotWater}</Text>
                  </View>
                )}
                {spot.amenities.kitchen && (
                  <View className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Text className="text-sm">{AMENITIES.kitchen}</Text>
                  </View>
                )}
                {spot.amenities.bbq && (
                  <View className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Text className="text-sm">{AMENITIES.bbq}</Text>
                  </View>
                )}
                {spot.amenities.firePit && (
                  <View className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Text className="text-sm">{AMENITIES.firePit}</Text>
                  </View>
                )}
                {spot.amenities.pool && (
                  <View className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Text className="text-sm">{AMENITIES.pool}</Text>
                  </View>
                )}
                {spot.amenities.sauna && (
                  <View className="p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <Text className="text-sm">{AMENITIES.sauna}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View className="h-px w-full bg-gray-200 dark:bg-gray-700" />
          <View className="space-y-2">
            <View className="flex flex-row justify-between">
              <View className="flex flex-row items-center space-x-2">
                <Text className="text-xl">
                  {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
                </Text>
                <Text>·</Text>
                <View className="flex flex-row items-center space-x-1">
                  <Star size={20} className="text-black dark:text-white" />
                  <Text className="pt-1">{spot.rating._avg.rating?.toFixed(1)}</Text>
                </View>
              </View>
              {me && (
                <Button onPress={() => navigation.navigate("NewReviewScreen", { spotId: spot.id })} variant="secondary">
                  Add review
                </Button>
              )}
            </View>
            <View>
              {spot.reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </View>
          </View>
        </View>
      </Animated.ScrollView>
      <Animated.View
        className="absolute left-0 right-0 top-0 h-[100px] border border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black"
        style={topBarStyle}
      />

      <View className="absolute left-0 right-0 top-14 flex flex-row justify-between px-6">
        <TouchableOpacity
          onPress={navigation.canGoBack() ? navigation.goBack : () => navigation.navigate("AppLayout")}
          activeOpacity={0.8}
          className="sq-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800"
        >
          {navigation.canGoBack() ? (
            <ChevronLeft className="pr-1 text-black dark:text-white" />
          ) : (
            <ChevronDown className="pr-1 text-black dark:text-white" />
          )}
        </TouchableOpacity>
        <View className="flex flex-row items-center space-x-3">
          {/* <TouchableOpacity
            onPress={handleGetDirections}
            activeOpacity={0.8}
            className="sq-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800"
          >
            <Share2 size={20} className="text-black dark:text-white" />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={handleGetDirections}
            activeOpacity={0.8}
            className="sq-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800"
          >
            <Compass size={20} className="text-black dark:text-white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("SaveScreen", { id: spot.id })}
            activeOpacity={0.8}
            className="sq-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800"
          >
            <Heart
              size={20}
              className="text-black dark:text-white"
              fill={data.spotLists && data.spotLists.length > 0 ? (isDark ? "white" : "black") : undefined}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

function SpotLoading() {
  return (
    <View>
      <Skeleton className="h-[300px] w-full" />
      <View className="space-y-4 p-4">
        <View className="space-y-2">
          <View className="flex flex-row items-center space-x-1">
            <Skeleton className="sq-5 rounded-full" />
            <Skeleton className="h-[20px] w-[80px]" />
            <Skeleton className="h-[20px] w-[120px]" />
          </View>
          <Skeleton className="h-[60px] w-11/12" />
          <View className="flex flex-row items-center space-x-1">
            <Skeleton className="sq-5 rounded-full" />
            <Skeleton className="h-[20px] w-7" />
            <Skeleton className="h-[20px] w-[80px]" />
          </View>
          <View />
          <Skeleton className="h-px w-full" />
          <View />
          <Skeleton className="h-[500px] w-full" />
        </View>
      </View>
    </View>
  )
}

function Skeleton(props: ViewProps) {
  return <View {...props} className={merge("rounded-lg bg-gray-100 dark:bg-gray-700", props.className)} />
}
