import * as React from "react"
import { Alert, Share as RNShare, TouchableOpacity, useColorScheme, View, type ViewProps } from "react-native"
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
import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
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
  Languages,
  Route,
  Share,
  Star,
  Trash,
} from "lucide-react-native"

import { type Spot } from "@ramble/database/types"
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

import { Icon } from "~/components/Icon"
import { LanguageSelector } from "~/components/LanguageSelector"
import { PartnerLink } from "~/components/PartnerLink"
import { ReviewItem } from "~/components/ReviewItem"
import { SpotTypeBadge } from "~/components/SpotTypeBadge"
import { Button } from "~/components/ui/Button"
import { Heading } from "~/components/ui/Heading"
import { SpotImageCarousel } from "~/components/ui/SpotImageCarousel"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { VerifiedCard } from "~/components/VerifiedCard"
import { api } from "~/lib/api"
import { FULL_WEB_URL } from "~/lib/config"
import { height, isAndroid, width } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
import { AMENITIES_ICONS } from "~/lib/models/amenities"

export default function SpotDetailScreen() {
  const { me } = useMe()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const params = useLocalSearchParams<{ id: string }>()
  const { data, isLoading } = api.spot.detail.useQuery({ id: params.id }, { cacheTime: Infinity })
  const spot = data?.spot
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
    } catch (error) {}
  }
  const utils = api.useUtils()
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
          <SpotImageCarousel canAddMore width={width} height={height * 0.37} images={spot.images} spotId={spot.id} />
        </Animated.View>
        <View className="space-y-3 p-4">
          <View className="space-y-2">
            <View className="space-y-2">
              <SpotTypeBadge spot={spot} />
              <Heading className="font-600 text-2xl leading-7">{spot.name}</Heading>
            </View>
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
            <View className="flex flex-row">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={me ? () => router.push(`/${tab}/${spot.creator.username}/(profile)`) : () => router.push("/login")}
              >
                <Text className="text-sm underline">
                  {spot.creator.firstName} {spot.creator.lastName}
                </Text>
              </TouchableOpacity>
              <Text className="text-sm"> added on {dayjs(spot.createdAt).format("DD/MM/YYYY")}</Text>
            </View>
          </View>
          <View className="space-y-1">
            <View>{isPartnerSpot(spot) ? <PartnerLink spot={spot} /> : <VerifiedCard spot={spot} />}</View>
            <View>
              <TranslateSpotDescription
                spot={spot}
                hash={data.descriptionHash}
                translatedDescription={data.translatedDescription}
              />
            </View>
            <Text className="font-400-italic text-sm">{spot.address}</Text>
            {spot.amenities && (
              <View className="flex flex-row flex-wrap gap-2">
                {Object.entries(AMENITIES).map(([key, value]) => {
                  if (!spot.amenities?.[key as keyof typeof AMENITIES]) return null
                  const icon = AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]
                  return (
                    <View
                      key={key}
                      className="rounded-xs flex flex-row space-x-1 border border-gray-200 p-2 dark:border-gray-700"
                    >
                      {icon && <Icon icon={icon} size={20} />}
                      <Text className="text-sm">{value}</Text>
                    </View>
                  )
                })}
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
                  onPress={() => router.push(`/${tab}/spot/${spot.id}/delete`)}
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
                  <Icon icon={Star} size={20} />
                  <Text className="pt-1">{displayRating(data.rating._avg.rating)}</Text>
                </View>
              </View>
              {me && (
                <Button onPress={() => router.push(`/${tab}/spot/${spot.id}/reviews/new`)} variant="secondary">
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
        </View>
      </Animated.ScrollView>

      {!isScrolledPassedThreshold && (
        <LinearGradient
          style={{ height: insets.top + 5 }}
          className="absolute left-0 right-0 top-0"
          colors={["#231C18", "transparent"]}
        />
      )}

      <Animated.View
        className="bg-background dark:bg-background-dark absolute left-0 right-0 top-0 border border-b border-gray-200 dark:border-gray-800"
        style={[topBarStyle, { height: 50 + insets.top }]}
      />

      <View style={{ top: insets.top + 8 }} className="absolute left-0 right-0 flex w-full flex-row justify-between px-4">
        <View className="flex w-full flex-1 flex-row items-center space-x-0.5">
          <TouchableOpacity
            onPress={router.canGoBack() ? router.back : () => router.navigate("/")}
            activeOpacity={0.8}
            className="sq-8 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
          >
            {router.canGoBack() ? <Icon icon={ChevronLeft} className="pr-1" /> : <Icon icon={ChevronDown} className="pr-1" />}
          </TouchableOpacity>
          <Animated.Text
            style={[nameStyle, { maxWidth: width - 175 }]}
            className="font-400 pr-4 text-lg text-black dark:text-white"
            numberOfLines={1}
          >
            {spot.name}
          </Animated.Text>
        </View>
        <View className="flex flex-shrink-0 flex-row items-center space-x-3">
          <TouchableOpacity
            onPress={async () => {
              try {
                await RNShare.share({
                  title: spot.name,
                  message: isAndroid ? FULL_WEB_URL + `/spots/${spot.id}` : spot.name,
                  url: FULL_WEB_URL + `/spots/${spot.id}`,
                })
              } catch (error: unknown) {
                if (error instanceof Error) {
                  Alert.alert(error.message)
                }
              }
            }}
            activeOpacity={0.8}
            className="sq-8 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
          >
            <Icon icon={Share} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleGetDirections}
            activeOpacity={0.8}
            className="sq-8 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
          >
            <Icon icon={Compass} size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push(`/spot/${spot.id}/save-to-list`)}
            activeOpacity={0.8}
            className="sq-8 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
          >
            <Icon icon={Heart} size={20} fill={data.isLiked ? (isDark ? "white" : "black") : "transparent"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/spot/${spot.id}/save-to-trip`)}
            activeOpacity={0.8}
            className="sq-8 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
          >
            <Icon
              icon={Route}
              size={20}
              // fill={data.isLiked ? (isDark ? "white" : "black") : "transparent"}
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
    const res = await fetch(FULL_WEB_URL + `/api/spots/${id}/translate/${lang}?hash=${hash}`)
    return await res.json()
  } catch {
    return "Error translating description"
  }
}

function TranslateSpotDescription(props: DescProps) {
  const modalProps = useDisclosure()
  const { me } = useMe()
  const [lang, setLang] = React.useState<string>(me?.preferredLanguage || "en")
  const { data, error, isInitialLoading } = useQuery<TranslateInput, string, string>({
    queryKey: ["spot-translation", { id: props.spot.id, lang, hash: props.hash || "" }],
    queryFn: () => getTranslation({ id: props.spot.id, lang, hash: props.hash || "" }),
    cacheTime: Infinity,
    enabled: !!me && lang !== me.preferredLanguage,
  })

  if (!props.spot.description) return null
  return (
    <View className="mt-2 space-y-1">
      <View className="flex flex-row items-center justify-between">
        <Text className="font-600">Description</Text>
        <Button
          leftIcon={<Icon icon={Languages} size={16} />}
          rightIcon={<Icon icon={ChevronDown} size={16} />}
          isLoading={isInitialLoading}
          variant="outline"
          disabled={!!!me}
          size="xs"
          onPress={modalProps.onOpen}
        >
          {languages.find((l) => l.code === lang)?.name || "English"}
        </Button>
      </View>
      <Text>{data || props.translatedDescription || props.spot.description}</Text>
      {error && <Text className="text-sm">{error}</Text>}
      <LanguageSelector modalProps={modalProps} selectedLanguage={lang} setSelectedLang={setLang} />
    </View>
  )
}
