import * as React from "react"
import { Animated, TouchableOpacity, useColorScheme, View, type ViewProps } from "react-native"
import RenderHtml, { defaultSystemFonts } from "react-native-render-html"
import { StatusBar } from "expo-status-bar"
import { BadgeX, ChevronDown, ChevronLeft, Heart, Star, Verified } from "lucide-react-native"

import { merge } from "@ramble/shared"

import { Button } from "../../../../../components/Button"
import { Heading } from "../../../../../components/Heading"
import { ReviewItem } from "../../../../../components/ReviewItem"
import { ImageCarousel } from "../../../../../components/SpotImageCarousel"
import { Text } from "../../../../../components/Text"
import { api } from "../../../../../lib/api"
import { width } from "../../../../../lib/device"
import { useMe } from "../../../../../lib/hooks/useMe"
import { useParams, useRouter } from "../../../../router"

export function SpotDetailScreen() {
  const colorScheme = useColorScheme()
  const { me } = useMe()
  const isDark = colorScheme === "dark"
  const { params } = useParams<"SpotDetailScreen">()
  const { data, isLoading } = api.spot.detail.useQuery({ id: params.id })
  const spot = data
  const scrolling = React.useRef(new Animated.Value(0)).current

  const navigation = useRouter()
  const opacity = scrolling.interpolate({
    inputRange: [100, 180],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  if (isLoading) return <SpotLoading />
  if (!spot)
    return (
      <View className="space-y-2 px-4 pt-20">
        <Text className="text-lg">Spot not found</Text>
        {navigation.canGoBack() && <Button onPress={navigation.goBack}>Back</Button>}
      </View>
    )
  const fonts = ["poppins400", "poppins600", ...defaultSystemFonts]
  return (
    <View>
      <StatusBar animated style={isDark ? "light" : "dark"} />
      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 200 }}
        style={{ flexGrow: 1 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrolling } } }], { useNativeDriver: true })}
      >
        <ImageCarousel width={width} height={300} images={spot.images} />

        <View className="space-y-4 p-4">
          <View className="space-y-2">
            {spot.verifiedAt && spot.verifier ? (
              <View className="flex flex-row items-center space-x-1">
                <Verified size={20} className="text-black dark:text-white" />
                <Text className="text-sm">Verified by</Text>
                <TouchableOpacity onPress={() => navigation.push("UsernameLayout", { username: spot.verifier?.username || "" })}>
                  <Text className="flex text-sm">{`${spot.verifier.firstName} ${spot.verifier.lastName}`}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex flex-row items-center space-x-1">
                <BadgeX size={20} className="text-black dark:text-white" />
                <Text className="text-sm">Unverified</Text>
              </View>
            )}
            <Heading className="text-2xl leading-7">{spot.name}</Heading>
            <View className="flex flex-row items-center space-x-1">
              <Star size={20} className="text-black dark:text-white" />
              <Text className="text-sm">{spot.rating._avg.rating ? spot.rating._avg.rating?.toFixed(1) : "Not rated"}</Text>
              <Text className="text-sm">·</Text>
              <Text className="text-sm">
                {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
              </Text>
            </View>
          </View>

          <View className="h-px w-full bg-gray-200 dark:bg-gray-600" />
          <View className="space-y-1">
            <RenderHtml
              systemFonts={fonts}
              baseStyle={{ fontSize: 16, fontFamily: "poppins400" }}
              contentWidth={width}
              source={{ html: spot.description }}
            />

            <Text className="text-sm">{spot.address}</Text>
          </View>
          <View className="h-px w-full bg-gray-200 dark:bg-gray-600" />
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
        style={{ opacity }}
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
        {me && (
          <TouchableOpacity
            onPress={() => navigation.navigate("SaveScreen", { id: spot.id })}
            activeOpacity={0.8}
            className="sq-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-800"
          >
            <Heart
              size={20}
              className="text-black dark:text-white"
              fill={data.spotLists.length > 0 ? (isDark ? "white" : "black") : undefined}
            />
          </TouchableOpacity>
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
  return <View {...props} className={merge("rounded-lg bg-gray-100 dark:bg-gray-700", props.className)} />
}
