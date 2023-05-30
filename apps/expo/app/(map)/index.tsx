import Mapbox, { Camera, MarkerView } from "@rnmapbox/maps"
import * as React from "react"
import { ScrollView, TouchableOpacity, View, useColorScheme } from "react-native"

import { INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"
import { Link } from "expo-router"
import { BadgeX, Star, Verified, X } from "lucide-react-native"
import { Spinner } from "../../components/Spinner"
import { Text } from "../../components/Text"
import { api } from "../../lib/api"
import { SPOTS } from "../../lib/spots"
import { Image } from "expo-image"

Mapbox.setAccessToken("pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw")

export default function Home() {
  const spots = api.spot.all.useQuery()
  const [activeSpot, setActiveSpot] = React.useState<(typeof spots)["data"][number] | null>(null)
  const camera = React.useRef<Camera>(null)
  React.useEffect(() => {
    // camera.current?.setCamera({
    //   centerCoordinate: [lon, lat],
    // });
  }, [])

  const theme = useColorScheme()
  const isDark = theme === "dark"
  return (
    <View className="flex-1">
      <Mapbox.MapView
        className="flex-1"
        logoEnabled={false}
        compassEnabled
        compassFadeWhenNorth
        scaleBarEnabled={false}
        styleURL={
          isDark ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1" : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
        }
      >
        {/* <UserLocation /> */}
        <Camera ref={camera} defaultSettings={{ centerCoordinate: [INITIAL_LONGITUDE, INITIAL_LATITUDE] }} />
        {spots?.data?.map((spot) => {
          const Icon = SPOTS[spot.type].Icon
          return (
            <MarkerView key={spot.id} coordinate={[spot.longitude, spot.latitude]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveSpot(spot)}
                className="bg-primary-500 sq-8 flex items-center justify-center rounded-full"
              >
                <Icon size={20} color="white" />
              </TouchableOpacity>
            </MarkerView>
          )
        })}
      </Mapbox.MapView>
      {activeSpot && <SpotPreview id={activeSpot.id} onClose={() => setActiveSpot(null)} />}
    </View>
  )
}

function SpotPreview({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: spot, isLoading } = api.spot.byId.useQuery({ id })
  const colorScheme = useColorScheme()

  return (
    <View className="absolute bottom-2 left-2 right-2 rounded-md bg-white p-5 dark:bg-gray-900">
      <TouchableOpacity onPress={onClose} className="absolute right-2 top-2">
        <X size={24} color={colorScheme === "dark" ? "white" : "black"} />
      </TouchableOpacity>
      {isLoading ? (
        <Spinner />
      ) : !spot ? (
        <Text>Not found</Text>
      ) : (
        <View className="space-y-4">
          <View className="space-y-1">
            {spot.verifiedAt && spot.verifier ? (
              <View className="flex flex-row items-center space-x-1 text-sm">
                <Verified size={16} />
                <Text>Verified by</Text>
                <Link href={`/${spot.verifier.username}`} className="flex flex-row hover:underline">
                  {`${spot.verifier.firstName} ${spot.verifier.lastName}`}
                </Link>
              </View>
            ) : (
              <View className="flex flex-row items-center space-x-1 text-sm">
                <BadgeX size={16} />
                <Text>Unverified</Text>
              </View>
            )}
            <Link href={`/spots/${spot.id}`} className="text-lg leading-6 text-black hover:underline dark:text-white">
              {spot.name}
            </Link>
            <View className="flex flex-row flex-wrap items-center space-x-1 text-sm">
              <Star size={16} />

              {/* <Text>{rating._avg.rating?.toFixed(1) || "Not rated"}</Text>} */}
              <Text>{5 || "Not rated"}</Text>

              <Text>·</Text>
              <Text>
                {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
              </Text>
            </View>
          </View>
          <ScrollView horizontal className="space-x-1" bounces snapToAlignment="start">
            {spot.images.map((image) => (
              <Image key={image.id} source={{ uri: image.path }} className="h-[200px] w-[300px] rounded-md object-cover" />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}
