// import * as React from "react"
import { useParams, useRouter } from "../../../../router"
import { TouchableOpacity, View } from "react-native"
import { Text } from "../../../../../components/ui/Text"
import { join } from "@ramble/shared"
import { isAndroid } from "../../../../../lib/device"
import { Icon } from "../../../../../components/Icon"
import { ChevronLeft } from "lucide-react-native"
import { BrandHeading } from "../../../../../components/ui/BrandHeading"

export function SpotReportScreen() {
  const { params } = useParams<"SpotReportScreen">()

  // const [coords, setCoords] = React.useState<number[]>([params.longitude, params.latitude])

  // const camera = React.useRef<Camera>(null)
  // const mapRef = React.useRef<MapType>(null)

  // const { me } = useMe()
  // const router = useRouter()

  // const handleSetUserLocation = async () => {
  //   try {
  //     const loc = await Location.getLastKnownPositionAsync()
  //     if (!loc) return
  //     camera.current?.setCamera({
  //       zoomLevel: 14,
  //       animationDuration: 0,
  //       animationMode: "none",
  //       centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
  //     })
  //   } catch {
  //     console.log("oops -  setting location")
  //   }
  // }
  // const onMapMove = ({ properties }: MapState) => setCoords(properties.center)

  const navigation = useRouter()

  return (
    <View className={join("bg-background dark:bg-background-dark h-full flex-grow px-4", isAndroid ? "pt-14" : "pt-10")}>
      <View className="flex flex-row justify-between pb-2">
        <View className={join("flex flex-row items-center space-x-0.5")}>
          <TouchableOpacity onPress={navigation.goBack} className="mt-1 p-1">
            <Icon icon={ChevronLeft} size={24} color="primary" />
          </TouchableOpacity>
          <BrandHeading className="text-3xl">Report spot</BrandHeading>
        </View>
      </View>
      <View>
        <Text>Edit the below information to let us know what you think is correct</Text>
      </View>
    </View>
    // <EditSpotModalView shouldRenderToast title="Edit spot" canGoBack={false}>
    //   <Map
    //     className="rounded-xs mb-10 mt-4 flex-1 overflow-hidden"
    //     onMapIdle={onMapMove}
    //     ref={mapRef}
    //     styleURL="mapbox://styles/jclackett/clp122bar007z01qu21kc8h4g"
    //   >
    //     <UserLocation />
    //     <Camera ref={camera} allowUpdates defaultSettings={{ centerCoordinate: coords, zoomLevel: 14 }} />
    //   </Map>
    //   <View
    //     style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
    //     className="absolute left-1/2 top-1/2 flex items-center justify-center"
    //   >
    //     <Icon icon={CircleDot} size={30} color="white" />
    //   </View>

    //   <View className="absolute bottom-12 left-5 right-5 flex flex-row items-center justify-between space-y-2">
    //     <View className="w-12" />

    //     <Button
    //       className="bg-background rounded-full"
    //       textClassName="text-black"
    //       onPress={() => {
    //         if (!me) return
    //         if (!me.isVerified) return toast({ title: "Please verify your account" })
    //         if (!coords[0] || !coords[1]) return toast({ title: "Please select a location" })
    //         router.push("EditSpotTypeScreen", { ...params, latitude: coords[1], longitude: coords[0] })
    //       }}
    //     >
    //       Next
    //     </Button>

    //     <TouchableOpacity
    //       activeOpacity={0.8}
    //       onPress={handleSetUserLocation}
    //       className="sq-12 bg-background flex flex-row items-center justify-center rounded-full"
    //     >
    //       <Icon icon={Navigation} size={20} color="black" />
    //     </TouchableOpacity>
    //   </View>
    // </EditSpotModalView>
  )
}
