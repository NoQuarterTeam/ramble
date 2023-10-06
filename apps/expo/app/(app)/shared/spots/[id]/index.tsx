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
import dayjs from "dayjs"
import * as Location from "expo-location"
import { StatusBar } from "expo-status-bar"
import { Check, ChevronDown, ChevronLeft, Compass, Edit2, Heart, Star, Trash } from "lucide-react-native"

import { AMENITIES, canManageSpot, displayRating, merge } from "@ramble/shared"

import { ReviewItem } from "../../../../../components/ReviewItem"
import { Button } from "../../../../../components/ui/Button"
import { Heading } from "../../../../../components/ui/Heading"
import { ImageCarousel } from "../../../../../components/ui/ImageCarousel"
import { Text } from "../../../../../components/ui/Text"
import { toast } from "../../../../../components/ui/Toast"
import { VerifiedCard } from "../../../../../components/VerifiedCard"
import { api } from "../../../../../lib/api"
import { width } from "../../../../../lib/device"
import { useMe } from "../../../../../lib/hooks/useMe"
import { AMENITIES_ICONS } from "../../../../../lib/models/amenities"
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
  const router = useRouter()

  const topBarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translationY.value, [100, 200], [0, 1], Extrapolation.CLAMP)
    return { opacity }
  })
  const nameStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translationY.value, [240, 320], [0, 1], Extrapolation.CLAMP)
    return { opacity }
  })

  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(translationY.value, [-400, 0], [2.7, 1], Extrapolation.CLAMP)
    const translateY = interpolate(translationY.value, [-400, 0], [-180, 0], Extrapolation.CLAMP)
    return { transform: [{ scale }, { translateY }] }
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
  const utils = api.useContext()
  const { mutate: verifySpot, isLoading: isVerifyingLoading } = api.spot.verify.useMutation({
    onSuccess: async () => {
      if (!spot) return
      try {
        await utils.spot.detail.refetch({ id: spot.id })
        toast({ title: "Spot verified!" })
      } catch {
        toast({ type: "error", title: "Error refetching spot" })
      }
    },
  })

  if (isLoading) return <SpotLoading />
  if (!spot)
    return (
      <View className="space-y-2 px-4 pt-16">
        <Text className="text-lg">Spot not found</Text>
        {router.canGoBack() && <Button onPress={router.goBack}>Back</Button>}
      </View>
    )
  return (
    <View>
      <StatusBar animated style={isDark ? "light" : "dark"} />
      <Animated.ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 300 }}
        style={{ flexGrow: 1 }}
        onScroll={scrollHandler}
      >
        <Animated.View style={imageStyle}>
          <ImageCarousel width={width} height={300} images={spot.images} />
        </Animated.View>
        <View className="space-y-3 p-4">
          <View className="space-y-2">
            <Heading className="text-2xl leading-7">{spot.name}</Heading>
            <View className="flex flex-row items-center space-x-2">
              <View className="flex flex-row items-center space-x-1">
                <Star size={16} className="text-black dark:text-white" />
                <Text className="text-sm">{displayRating(spot.rating._avg.rating)}</Text>
              </View>
              <View className="flex flex-row flex-wrap items-center space-x-1">
                <Heart size={16} className="text-black dark:text-white" />
                <Text className="text-sm">{spot._count.listSpots || 0}</Text>
              </View>
            </View>
          </View>
          <View className="space-y-1">
            <View>
              <VerifiedCard spot={spot} />
            </View>
            <Text>{spot.description}</Text>
            <Text className="font-400-italic text-sm">{spot.address}</Text>
            {spot.amenities && (
              <View className="flex flex-row flex-wrap gap-2">
                {Object.entries(AMENITIES).map(([key, value]) => {
                  if (!spot.amenities?.[key as keyof typeof AMENITIES]) return null
                  const Icon = AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]
                  return (
                    <View
                      key={key}
                      className="rounded-xs flex flex-row space-x-1 border border-gray-200 p-2 dark:border-gray-700"
                    >
                      {Icon && <Icon size={20} className="text-black dark:text-white" />}
                      <Text className="text-sm">{value}</Text>
                    </View>
                  )
                })}
              </View>
            )}
            <View className="flex flex-row py-2">
              <Text className="text-sm">Added by </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push("UserScreen", { username: spot.creator.username })}
              >
                <Text className="text-sm">
                  {spot.creator.firstName} {spot.creator.lastName}
                </Text>
              </TouchableOpacity>
              <Text className="text-sm"> on the {dayjs(spot.createdAt).format("DD/MM/YYYY")}</Text>
            </View>
            <View className="flex flex-row space-x-2 py-4">
              {canManageSpot(spot, me) && !spot.verifiedAt && (
                <Button
                  size="sm"
                  onPress={() => verifySpot({ id: spot.id })}
                  isLoading={isVerifyingLoading}
                  leftIcon={<Check size={18} className="text-white dark:text-black" />}
                >
                  Verify
                </Button>
              )}
              {canManageSpot(spot, me) && (
                <Button
                  size="sm"
                  onPress={() =>
                    router.push("EditSpotLayout", {
                      id: spot.id,
                      latitude: spot.latitude,
                      longitude: spot.longitude,
                      type: spot.type,
                      name: spot.name,
                      description: spot.description,
                      isPetFriendly: spot.isPetFriendly,
                      amenities: spot.amenities || undefined,
                      images: spot.images.map((i) => i.path),
                    })
                  }
                  variant="outline"
                  leftIcon={<Edit2 size={18} className="text-black dark:text-white" />}
                >
                  Edit
                </Button>
              )}
              {me?.isAdmin && (
                <Button
                  size="sm"
                  onPress={() => router.push("DeleteSpotScreen", { id: spot.id })}
                  variant="destructive"
                  leftIcon={<Trash size={18} className="text-white" />}
                >
                  Delete
                </Button>
              )}
            </View>
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
                  <Text className="pt-1">{displayRating(spot.rating._avg.rating)}</Text>
                </View>
              </View>
              {me && (
                <Button onPress={() => router.navigate("NewReviewScreen", { spotId: spot.id })} variant="secondary">
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
        className="bg-background dark:bg-background-dark absolute left-0 right-0 top-0 h-[100px] border border-b border-gray-200 dark:border-gray-800"
        style={topBarStyle}
      />

      <View className="absolute left-0 right-0 top-14 flex flex-row justify-between px-4">
        <View className="flex flex-row items-center space-x-0.5">
          <TouchableOpacity
            onPress={router.canGoBack() ? router.goBack : () => router.navigate("AppLayout")}
            activeOpacity={0.8}
            className="sq-8 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
          >
            {router.canGoBack() ? (
              <ChevronLeft className="pr-1 text-black dark:text-white" />
            ) : (
              <ChevronDown className="pr-1 text-black dark:text-white" />
            )}
          </TouchableOpacity>
          <Animated.View style={[{ width: width - 148 }, nameStyle]}>
            <Text className="text-lg text-black dark:text-white" numberOfLines={1}>
              {spot.name}
            </Text>
          </Animated.View>
        </View>
        <View className="flex flex-row items-center space-x-3">
          {/* <TouchableOpacity
            // onPress={handleGetDirections}
            activeOpacity={0.8}
            className="sq-8 flex items-center justify-center rounded-full bg-background dark:bg-background-dark"
          >
            <Share size={20} className="text-black dark:text-white" />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={handleGetDirections}
            activeOpacity={0.8}
            className="sq-8 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
          >
            <Compass size={20} className="text-black dark:text-white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.navigate("SaveSpotScreen", { id: spot.id })}
            activeOpacity={0.8}
            className="sq-8 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
          >
            <Heart
              size={20}
              className="text-black dark:text-white"
              fill={data.listSpots && data.listSpots.length > 0 ? (isDark ? "white" : "black") : undefined}
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
  return <View {...props} className={merge("rounded-xs bg-gray-100 dark:bg-gray-700", props.className)} />
}
