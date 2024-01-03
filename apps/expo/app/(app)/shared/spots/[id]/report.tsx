import * as React from "react"

import { useParams, useRouter } from "../../../../router"
import { Modal, TouchableOpacity, View } from "react-native"
import { Text } from "../../../../../components/ui/Text"
import { AMENITIES, doesSpotTypeRequireAmenities, join } from "@ramble/shared"
import { isAndroid } from "../../../../../lib/device"
import { Icon } from "../../../../../components/Icon"
import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { BrandHeading } from "../../../../../components/ui/BrandHeading"
import { RouterOutputs, api } from "../../../../../lib/api"
import { Spinner } from "../../../../../components/ui/Spinner"
import { FormInputLabel } from "../../../../../components/ui/FormInput"
import { Input } from "../../../../../components/ui/Input"
import { Button } from "../../../../../components/ui/Button"
import { toast } from "../../../../../components/ui/Toast"
import { AmenityObject } from "../../../../../components/AmenitySelector"
import { ReportSpotEditInfo } from "./components/ReportSpotEditInfo"
import { ReportSpotEditLocation } from "./components/ReportSpotEditLocation"
import { ReportSpotEditType } from "./components/ReportSpotEditType"
import { ReportSpotEditAmenities } from "./components/ReportSpotEditAmenities"
import { ReportSpotEditImages } from "./components/ReportSpotEditImages"

export type IsEditing = "info" | "location" | "type" | "amenities" | "images" | null

export function SpotReportScreen() {
  const { params } = useParams<"SpotReportScreen">()

  const { data: spot, isLoading } = api.spot.report.useQuery({ id: params.id })

  if (isLoading)
    return (
      <View className="flex h-full items-center justify-center py-4">
        <Spinner />
      </View>
    )
  if (!spot) return null
  return <ReportFlow spot={spot} />
}

interface Props {
  spot: RouterOutputs["spot"]["report"]
}

function ReportFlow({ spot }: Props) {
  const router = useRouter()

  const [name, setName] = React.useState(spot.name)
  const [description, setDescription] = React.useState(spot.description || "")
  const [isPetFriendly, setIsPetFriendly] = React.useState(spot.isPetFriendly)
  const [isLocationUnknown, setIsLocationUnknown] = React.useState<boolean | null>(null)
  const [latitude, setLatitude] = React.useState(spot.latitude)
  const [longitude, setLongitude] = React.useState(spot.longitude)
  const [type, setType] = React.useState(spot.type)
  const [amenities, setAmenities] = React.useState(
    spot.amenities
      ? Object.entries(spot.amenities).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as AmenityObject)
      : Object.keys(AMENITIES).reduce((acc, key) => ({ ...acc, [key]: false }), {} as AmenityObject),
  )
  const [flaggedImageIds, setFlaggedImageIds] = React.useState<string[]>([])
  const [notes, setNotes] = React.useState("")
  const [isEditing, setIsEditing] = React.useState<IsEditing>()

  const handleClose = () => setIsEditing(null)

  const { mutate, isLoading, error } = api.spotRevision.create.useMutation({
    onSuccess: () => {
      router.navigate("SpotDetailScreen", { id: spot.id })
      toast({ title: "Report submitted", message: "Thank you for making Ramble even better!" })
    },
    onError: () => {
      toast({ type: "error", title: "Error submitting report" })
      console.log(error)
    },
  })

  const handleSubmit = () => {
    if (!notes) return toast({ title: "Notes are required" })
    const revisionNotes = {
      name,
      description,
      isLocationUnknown,
      // address: data.address || customAddress,
      latitude,
      longitude,
      isPetFriendly,
      type,
      amenities,
      flaggedImageIds: flaggedImageIds.join(", "),
      notes,
    }
    mutate({ spotId: spot.id, notes: JSON.stringify(revisionNotes) })
  }

  return (
    <View className={join("bg-background dark:bg-background-dark h-full flex-grow px-4", isAndroid ? "pt-14" : "pt-10")}>
      <View className="flex flex-row justify-between pb-2">
        <View className={"flex flex-row items-center space-x-0.5"}>
          <TouchableOpacity onPress={router.goBack} className="mt-1 p-1">
            <Icon icon={ChevronLeft} size={24} color="primary" />
          </TouchableOpacity>
          <BrandHeading className="text-3xl">Report incorrect data</BrandHeading>
        </View>
      </View>
      <View className="flex space-y-4">
        <Text>Let us know what you think is incorrect</Text>
        <View className="flex space-y-5">
          <TouchableOpacity className="flex flex-row items-center justify-between" onPress={() => setIsEditing("info")}>
            <View>
              <Text className="text-lg">Basic info</Text>
              <Text className="text-sm text-gray-400">the name or description is incorrect</Text>
            </View>
            <Icon icon={ChevronRight} size={24} color="primary" />
          </TouchableOpacity>
          <TouchableOpacity className="flex flex-row items-center justify-between" onPress={() => setIsEditing("location")}>
            <View>
              <Text className="text-lg">Location</Text>
              <Text className="text-sm text-gray-400">the location is incorrect</Text>
            </View>
            <Icon icon={ChevronRight} size={24} color="primary" />
          </TouchableOpacity>
          <TouchableOpacity className="flex flex-row items-center justify-between" onPress={() => setIsEditing("type")}>
            <View>
              <Text className="text-lg">Type</Text>
              <Text className="text-sm text-gray-400">the spot is a different type</Text>
            </View>
            <Icon icon={ChevronRight} size={24} color="primary" />
          </TouchableOpacity>
          {doesSpotTypeRequireAmenities(spot.type) && (
            <TouchableOpacity className="flex flex-row items-center justify-between" onPress={() => setIsEditing("amenities")}>
              <View>
                <Text className="text-lg">Amenities</Text>
                <Text className="text-sm text-gray-400">the amenities are incorrect</Text>
              </View>
              <Icon icon={ChevronRight} size={24} color="primary" />
            </TouchableOpacity>
          )}
          <TouchableOpacity className="flex flex-row items-center justify-between" onPress={() => setIsEditing("images")}>
            <View>
              <Text className="text-lg">Images</Text>
              <Text className="text-sm text-gray-400">the images are inaccurate or inappropriate</Text>
            </View>
            <Icon icon={ChevronRight} size={24} color="primary" />
          </TouchableOpacity>
          <View>
            <FormInputLabel label="Notes" />
            <Input value={notes} onChangeText={setNotes} />
            <Text className="text-sm text-gray-400">Tell us more about what was wrong</Text>
          </View>
          {error && <Text className="text-red-500">{error.message}</Text>}
          <Button onPress={handleSubmit} isLoading={isLoading}>
            Submit report
          </Button>
        </View>
      </View>
      <Modal animationType="slide" visible={!!isEditing} style={{ margin: 0 }}>
        <View className={join("bg-background dark:bg-background-dark h-full flex-grow px-6", isAndroid ? "pt-16" : "pt-12")}>
          {isEditing === "info" ? (
            <ReportSpotEditInfo
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              isPetFriendly={isPetFriendly}
              setIsPetFriendly={setIsPetFriendly}
              handleClose={handleClose}
            />
          ) : isEditing === "location" ? (
            <ReportSpotEditLocation
              isLocationUnknown={isLocationUnknown}
              setIsLocationUnknown={setIsLocationUnknown}
              latitude={latitude}
              setLatitude={setLatitude}
              longitude={longitude}
              setLongitude={setLongitude}
              handleClose={handleClose}
            />
          ) : isEditing === "type" ? (
            <ReportSpotEditType type={type} setType={setType} handleClose={handleClose} />
          ) : isEditing === "amenities" ? (
            <ReportSpotEditAmenities amenities={amenities} setAmenities={setAmenities} handleClose={handleClose} />
          ) : isEditing === "images" ? (
            <ReportSpotEditImages
              images={spot.images.map((i) => ({ id: i.id, path: i.path }))}
              flaggedImageIds={flaggedImageIds}
              setFlaggedImageIds={setFlaggedImageIds}
              handleClose={handleClose}
            />
          ) : null}
        </View>
      </Modal>
    </View>
  )
}
