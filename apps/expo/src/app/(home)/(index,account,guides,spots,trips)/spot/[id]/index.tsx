import * as Sentry from "@sentry/react-native"
import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Compass,
  Edit2,
  Flag,
  Heart,
  Images,
  Languages,
  Route,
  Share,
  Star,
  Sunrise,
  Sunset,
  Trash,
} from "lucide-react-native"
import * as React from "react"
import { Alert, Share as RNShare, ScrollView, TouchableOpacity, View, type ViewProps, useColorScheme } from "react-native"
import { showLocation } from "react-native-map-link"
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import type { Spot } from "@ramble/database/types"
import {
  AMENITIES,
  canManageSpot,
  displayRating,
  displaySaved,
  isPartnerSpot,
  languages,
  merge,
  useDisclosure,
} from "@ramble/shared"

import { Camera, LocationPuck, MarkerView } from "@rnmapbox/maps"
import utc from "dayjs/plugin/utc"
import { CreatorCard } from "~/components/CreatorCard"
import { Icon } from "~/components/Icon"
import { LanguageSelector } from "~/components/LanguageSelector"
import { MapView } from "~/components/Map"
import { PartnerLink } from "~/components/PartnerLink"
import { ReviewItem } from "~/components/ReviewItem"
import { SpotImageCarousel } from "~/components/SpotImageCarousel"
import { SpotMarker } from "~/components/SpotMarker"
import { SpotTypeBadge } from "~/components/SpotTypeBadge"
import { Button } from "~/components/ui/Button"
import { Heading } from "~/components/ui/Heading"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { FULL_WEB_URL } from "~/lib/config"
import { height, isAndroid, width } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
import { AMENITIES_ICONS } from "~/lib/models/amenities"

dayjs.extend(advancedFormat)
dayjs.extend(utc)

export default function SpotDetailScreen() {
  const { me } = useMe()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const params = useLocalSearchParams<{ id: string }>()
  const { data, isLoading } = api.spot.detail.useQuery({ id: params.id }, { staleTime: Number.POSITIVE_INFINITY })
  const spot = data?.spot

  const forecastDays = data?.weather

  const translationY = useSharedValue(0)
  const [isScrolledPassedThreshold, setIsScrolledPassedThreshold] = React.useState(false)

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        translationY.value = event.contentOffset.y
        if (event.contentOffset.y > 200) {
          if (!isScrolledPassedThreshold) {
            runOnJS(setIsScrolledPassedThreshold)(true)
          }
        } else {
          if (isScrolledPassedThreshold) {
            runOnJS(setIsScrolledPassedThreshold)(false)
          }
        }
      },
    },
    [isScrolledPassedThreshold],
  )

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

  const handleGetDirections = async () => {
    try {
      if (!spot) return
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") return
      const location = await Location.getCurrentPositionAsync()

      showLocation({
        latitude: spot.latitude,
        longitude: spot.longitude,
        sourceLatitude: location.coords.latitude,
        sourceLongitude: location.coords.longitude,
        title: spot.type !== "GAS_STATION" ? spot.name : spot.address || spot.name,
        googleForceLatLon: spot.type !== "GAS_STATION",
        alwaysIncludeGoogle: true,
        directionsMode: "car",
      })
    } catch (_error) {}
  }
  const utils = api.useUtils()
  const { mutate: verifySpot, isPending: isVerifyingLoading } = api.spot.verify.useMutation({
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

  const insets = useSafeAreaInsets()

  const tab = useTabSegment()

  if (isLoading) return <SpotLoading />
  if (!spot || !data)
    return (
      <View style={{ top: insets.top }} className="space-y-2 p-4">
        <Text className="text-lg">Spot not found</Text>
        {router.canGoBack() && <Button onPress={router.back}>Back</Button>}
      </View>
    )
  // if (!me)
  //   return (
  //     <ScreenView title={spot.name}>
  //       <SignupCta text="Log in to view more information about this spot" />
  //     </ScreenView>
  //   )

  return (
    <View>
      <StatusBar style={isDark ? "light" : isScrolledPassedThreshold ? "dark" : "light"} />
      <Animated.ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 300 }}
        style={{ flexGrow: 1 }}
        onScroll={scrollHandler}
      >
        <Animated.View style={imageStyle}>
          <SpotImageCarousel
            placeholderPaddingTop={insets.top}
            width={width}
            height={height * 0.37}
            images={spot.images}
            spot={spot}
          />
        </Animated.View>
        <View className="space-y-3 p-4">
          <View className="space-y-2">
            <SpotTypeBadge spot={spot} />
            <Heading className="font-600 text-2xl leading-7">{spot.name}</Heading>
            <View className="flex flex-row items-center space-x-2">
              <View className="flex flex-row flex-wrap items-center space-x-1">
                <Icon icon={Heart} size={16} fill={isDark ? "white" : "black"} />
                <Text className="text-sm">{displaySaved(spot._count.listSpots) || 0}</Text>
              </View>
              <View className="flex flex-row items-center space-x-1">
                <Icon icon={Star} size={16} fill={isDark ? "white" : "black"} />
                <Text className="text-sm">{displayRating(data.rating._avg.rating)}</Text>
              </View>
            </View>
          </View>
          <View className="space-y-2">
            <View>{isPartnerSpot(spot) ? <PartnerLink spot={spot} /> : <CreatorCard spot={spot} />}</View>
            {spot.description && (
              <View>
                <TranslateSpotDescription
                  spot={spot}
                  hash={data.descriptionHash}
                  translatedDescription={data.translatedDescription}
                />
              </View>
            )}
            {!me ? (
              <View className="w-full px-16 flex space-y-4 pt-4">
                <Text className="text-center text-xl">Sign up to see more</Text>
                <Button onPress={() => router.push("/login")}>Sign up</Button>
              </View>
            ) : (
              <>
                {spot.address && <Text className="font-400-italic text-sm">{spot.address}</Text>}
                {spot.amenities && (
                  <View className="flex flex-row flex-wrap gap-2">
                    {Object.entries(AMENITIES).map(([key, value]) => {
                      if (!spot.amenities?.[key as keyof typeof AMENITIES]) return null
                      const icon = AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]
                      return (
                        <View
                          key={key}
                          className="flex flex-row space-x-1 rounded-xs border border-gray-200 p-2 dark:border-gray-700"
                        >
                          {icon && <Icon icon={icon} size={20} />}
                          <Text className="text-sm">{value}</Text>
                        </View>
                      )
                    })}
                  </View>
                )}

                {data.tags.length > 0 && (
                  <View className="flex flex-row flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <View key={tag.name} className="p-2 rounded-sm border border-gray-200 dark:border-gray-700">
                        <Text className="text-sm">{tag.name}</Text>
                        <View className="absolute -top-1 -right-1 sq-4 flex items-center justify-center bg-background dark:bg-background-dark rounded-full border border-gray-200 dark:border-gray-700">
                          <Text className="text-xxs leading-3">{tag.count}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {forecastDays && forecastDays.length > 0 && (
                  <View className="pt-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex flex-row space-x-2">
                        {forecastDays.map((day) => (
                          <View
                            key={day[0]?.localTime}
                            className="border border-gray-200 dark:border-gray-700 rounded-sm p-2 space-y-1"
                          >
                            <Text className="font-600">{dayjs(day[0]?.localTime).format("ddd Do")}</Text>
                            <View className="flex flex-row space-x-3">
                              {day.map((forecast) => (
                                <View key={forecast.localTime} className="flex items-center">
                                  <View className="space-y-1 items-center">
                                    <Text>
                                      {forecast.isNow
                                        ? "Now"
                                        : dayjs(forecast.localTime)
                                            .utc()
                                            .format(forecast.isSunrise || forecast.isSunset ? "HH:mm" : "HH")}
                                    </Text>
                                    <View className="w-[40px] h-[40px] flex items-center justify-center">
                                      {forecast.isSunrise ? (
                                        <Icon icon={Sunrise} size={24} color="primary" />
                                      ) : forecast.isSunset ? (
                                        <Icon icon={Sunset} size={24} color="primary" />
                                      ) : (
                                        <Image
                                          style={{ width: 38, height: 38 }}
                                          source={{
                                            uri: `https://openweathermap.org/img/wn/${forecast.weather[0]!.icon}@2x.png`,
                                          }}
                                        />
                                      )}
                                    </View>
                                    <Text>
                                      {forecast.isSunrise
                                        ? "Sunrise"
                                        : forecast.isSunset
                                          ? "Sunset"
                                          : `${Math.round(forecast.main?.temp || 0)}°`}
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                <View className="space-y-2 py-4">
                  {me && (
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Icon icon={Flag} size={16} />}
                      onPress={() => router.push(`/${tab}/spot/${spot.id}/report`)}
                    >
                      Report spot
                    </Button>
                  )}
                  {canManageSpot(spot, me) && !spot.verifiedAt && (
                    <Button
                      size="sm"
                      onPress={() => verifySpot({ id: spot.id })}
                      isLoading={isVerifyingLoading}
                      leftIcon={<Icon icon={Check} size={18} />}
                    >
                      Verify
                    </Button>
                  )}
                  {canManageSpot(spot, me) && (
                    <Button
                      size="sm"
                      onPress={() => {
                        const searchParams = new URLSearchParams({
                          latitude: spot.latitude.toString(),
                          longitude: spot.longitude.toString(),
                          address: spot.address || "",
                          type: spot.type,
                          name: spot.name,
                          description: spot.description || "",
                          isPetFriendly: spot.isPetFriendly ? "true" : "false",
                          amenities: spot.amenities ? JSON.stringify(spot.amenities) : "",
                          images: spot.images.map((i) => i.path).join(","),
                        })
                        router.push(`/${tab}/spot/${spot.id}/edit?${searchParams}`)
                      }}
                      variant="outline"
                      leftIcon={<Icon icon={Edit2} size={18} />}
                    >
                      Edit
                    </Button>
                  )}
                  {me?.isAdmin && (
                    <Button
                      size="sm"
                      onPress={() => router.push(`/spot/${spot.id}/choose-cover`)}
                      variant="outline"
                      leftIcon={<Icon icon={Images} size={18} />}
                    >
                      Choose cover
                    </Button>
                  )}
                  {me?.isAdmin && (
                    <Button
                      size="sm"
                      onPress={() => router.push(`/${tab}/spot/${spot.id}/delete`)}
                      variant="destructive"
                      leftIcon={<Trash size={18} className="text-white" />}
                    >
                      Delete
                    </Button>
                  )}
                </View>
              </>
            )}
          </View>
          {me && (
            <>
              <MapView className="overflow-hidden rounded-xs h-[300px]" scrollEnabled={true}>
                <LocationPuck />
                <Camera
                  allowUpdates
                  followUserLocation={false}
                  defaultSettings={{
                    centerCoordinate: [spot.longitude, spot.latitude],
                    zoomLevel: 8,
                    pitch: 0,
                    heading: 0,
                  }}
                />

                <MarkerView allowOverlap allowOverlapWithPuck coordinate={[spot.longitude, spot.latitude]}>
                  <SpotMarker spot={spot} />
                </MarkerView>
              </MapView>

              <View className="h-px w-full bg-gray-200 dark:bg-gray-700" />
              <View className="space-y-2">
                <View className="flex flex-row justify-between">
                  <View className="flex flex-row items-center space-x-2">
                    <Text className="text-xl">
                      {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
                    </Text>
                    <Text>·</Text>
                    <View className="flex flex-row items-center space-x-1">
                      <Icon icon={Star} size={20} />
                      <Text className="pt-1">{displayRating(data.rating._avg.rating)}</Text>
                    </View>
                  </View>
                  {me && (
                    <Button size="sm" onPress={() => router.push(`/spot/${spot.id}/new-review`)} variant="secondary">
                      Add review
                    </Button>
                  )}
                </View>
                <View>
                  {spot.reviews.map((review) => (
                    <View key={review.id} className="mb-2">
                      <ReviewItem review={review} />
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </Animated.ScrollView>

      {!isScrolledPassedThreshold && (
        <LinearGradient
          style={{ height: insets.top + 5 }}
          className="absolute top-0 right-0 left-0"
          colors={["#231C18", "transparent"]}
        />
      )}
      <Animated.View
        className="absolute top-0 right-0 left-0 border-gray-200 border-b bg-background dark:border-gray-800 dark:bg-background-dark"
        style={[topBarStyle, { height: 50 + insets.top }]}
      />
      <View style={{ top: insets.top + 8 }} className="absolute right-0 left-0 flex w-full flex-row justify-between px-4">
        <View className="flex w-full flex-1 flex-row items-center space-x-0.5">
          <TouchableOpacity
            onPress={router.canGoBack() ? router.back : () => router.navigate("/")}
            activeOpacity={0.8}
            className="sq-8 flex items-center justify-center rounded-full bg-background dark:bg-background-dark"
          >
            {router.canGoBack() ? <Icon icon={ChevronLeft} className="pr-1" /> : <Icon icon={ChevronDown} className="pr-1" />}
          </TouchableOpacity>
          <Animated.Text
            style={[nameStyle, { maxWidth: width - 185 }]}
            className="pr-4 font-400 text-black text-lg dark:text-white"
            numberOfLines={1}
          >
            {spot.name}
          </Animated.Text>
        </View>
        {me && (
          <View className="flex flex-shrink-0 flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={async () => {
                try {
                  await RNShare.share({
                    title: spot.name,
                    message: isAndroid ? `${FULL_WEB_URL}/spots/${spot.id}` : spot.name,
                    url: `${FULL_WEB_URL}/spots/${spot.id}`,
                  })
                } catch (error: unknown) {
                  if (error instanceof Error) {
                    Alert.alert(error.message)
                  }
                }
              }}
              activeOpacity={0.8}
              className="sq-7 flex items-center justify-center rounded-full bg-background dark:bg-background-dark"
            >
              <Icon icon={Share} size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleGetDirections}
              activeOpacity={0.8}
              className="sq-7 flex items-center justify-center rounded-full bg-background dark:bg-background-dark"
            >
              <Icon icon={Compass} size={16} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/spot/${spot.id}/save-to-list`)}
              activeOpacity={0.8}
              className="sq-7 flex items-center justify-center rounded-full bg-background dark:bg-background-dark"
            >
              <Icon icon={Heart} size={16} fill={data.isLiked ? (isDark ? "white" : "black") : "transparent"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/spot/${spot.id}/save-to-trip`)}
              activeOpacity={0.8}
              className="sq-7 flex items-center justify-center rounded-full bg-background dark:bg-background-dark"
            >
              <Icon
                icon={Route}
                size={16}
                // fill={data.isLiked ? (isDark ? "white" : "black") : "transparent"}
              />
            </TouchableOpacity>
          </View>
        )}
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
  return <View {...props} className={merge("rounded-xs bg-gray-200 dark:bg-gray-700", props.className)} />
}

interface DescProps {
  spot: Pick<Spot, "id" | "description">
  hash?: string | null
  translatedDescription?: string | null
}

type TranslateInput = { id: string; lang: string; hash: string }
async function getTranslation({ id, lang, hash }: TranslateInput) {
  try {
    const res = await fetch(`${FULL_WEB_URL}/api/spots/${id}/translate/${lang}?hash=${hash}`)
    return await res.json()
  } catch (e) {
    Sentry.captureException(e)
    return "Error translating description"
  }
}

function TranslateSpotDescription(props: DescProps) {
  const modalProps = useDisclosure()
  const { me } = useMe()
  const [lang, setLang] = React.useState<string>(me?.preferredLanguage || "en")
  const { data, error, isLoading } = useQuery<TranslateInput, string, string>({
    queryKey: ["spot-translation", { id: props.spot.id, lang, hash: props.hash || "" }],
    queryFn: () => getTranslation({ id: props.spot.id, lang, hash: props.hash || "" }),
    staleTime: Number.POSITIVE_INFINITY,
    enabled: !!me && lang !== me.preferredLanguage,
  })

  if (!props.spot.description) return null
  return (
    <View className="space-y-1">
      <View className="flex flex-row items-center justify-between">
        <Text className="font-600">Description</Text>
        <Button
          leftIcon={<Icon icon={Languages} size={16} />}
          rightIcon={<Icon icon={ChevronDown} size={16} />}
          isLoading={isLoading}
          variant="outline"
          disabled={!me}
          size="xs"
          onPress={modalProps.onOpen}
        >
          {languages.find((l) => l.code === lang)?.name || "English"}
        </Button>
      </View>
      <Text numberOfLines={me ? undefined : 3}>{data || props.translatedDescription || props.spot.description}</Text>
      {error && <Text className="text-sm">{error}</Text>}
      <LanguageSelector modalProps={modalProps} selectedLanguage={lang} setSelectedLang={setLang} />
    </View>
  )
}
