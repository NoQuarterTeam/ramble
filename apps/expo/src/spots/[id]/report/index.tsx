import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { ChevronRight } from "lucide-react-native"

import { doesSpotTypeRequireAmenities } from "@ramble/shared"

import { Icon } from "../../../../../components/Icon"
import { Button } from "../../../../../components/ui/Button"
import { FormInputLabel } from "../../../../../components/ui/FormInput"
import { Input } from "../../../../../components/ui/Input"
import { ModalView } from "../../../../../components/ui/ModalView"
import { Spinner } from "../../../../../components/ui/Spinner"
import { Text } from "../../../../../components/ui/Text"
import { toast } from "../../../../../components/ui/Toast"
import { api, type RouterOutputs } from "../../../../../lib/api"
import { useParams, useRouter } from "../../../../router"

export function SpotReportScreen() {
  const { params } = useParams<"SpotReportScreen">()

  const { data: spot, isLoading } = api.spot.report.useQuery({ id: params.id })

  return (
    <ModalView title="report spot">
      {isLoading ? (
        <View className="flex items-center justify-center py-4">
          <Spinner />
        </View>
      ) : !spot ? (
        <View className="flex items-center justify-center py-4">
          <Text>Spot not found</Text>
        </View>
      ) : (
        <ReportFlow spot={spot} />
      )}
    </ModalView>
  )
}

interface Props {
  spot: RouterOutputs["spot"]["report"]
}

function ReportFlow({ spot }: Props) {
  const router = useRouter()
  const { params } = useParams<"SpotReportScreen">()

  const data = {
    name: params.name || spot.name,
    description: params.description || spot.description,
    isPetFriendly: params.isPetFriendly || spot.isPetFriendly,
    type: params.type || spot.type,
    amenities: params.amenities || spot.amenities,
    flaggedImageIds: params.flaggedImageIds,
    latitude: params.latitude || spot.latitude,
    longitude: params.longitude || spot.longitude,
    isLocationUnknown: params.isLocationUnknown,
  }

  const [notes, setNotes] = React.useState("")

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
    const revisionNotes = {
      ...data,
      flaggedImageIds: params.flaggedImageIds?.join(", "),
      notes,
    }
    mutate({ spotId: spot.id, notes: JSON.stringify(revisionNotes) })
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      className="flex-1 space-y-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 400 }}
    >
      <Text>Let us know what you think is incorrect</Text>
      <View className="space-y-5">
        <ReportLink
          title="Basic info"
          description="the name or description is incorrect"
          hasChanged={
            data.name !== spot.name || data.description !== spot.description || data.isPetFriendly !== spot.isPetFriendly
          }
          onPress={() => router.push("SpotReportInfoScreen", { id: spot.id, ...data })}
        />
        <ReportLink
          title="Location"
          description="the location is incorrect"
          hasChanged={data.latitude !== spot.latitude || data.longitude !== spot.longitude}
          onPress={() => router.push("SpotReportLocationScreen", { id: spot.id, ...data })}
        />
        <ReportLink
          title="Type"
          description="the spot is a different type"
          hasChanged={data.type !== spot.type}
          onPress={() => router.push("SpotReportTypeScreen", { id: spot.id, ...data })}
        />

        {doesSpotTypeRequireAmenities(data.type) && (
          <ReportLink
            title="Amenities"
            description="the amenities are incorrect"
            onPress={() => router.push("SpotReportAmenitiesScreen", { id: spot.id, ...data })}
            hasChanged={
              data.amenities && spot.amenities
                ? !!Object.keys(data.amenities).find(
                    (key) =>
                      data.amenities![key as keyof typeof data.amenities] !== spot.amenities![key as keyof typeof spot.amenities],
                  )
                : false
            }
          />
        )}
        <ReportLink
          title="Images"
          description="the images are inaccurate or inappropriate"
          hasChanged={params.flaggedImageIds && params.flaggedImageIds.length !== 0}
          onPress={() =>
            router.push("SpotReportImagesScreen", {
              id: spot.id,
              images: spot.images.map((i) => ({ id: i.id, path: i.path })),
              ...data,
            })
          }
        />
        <View>
          <FormInputLabel label="Notes" />
          <Input value={notes} onChangeText={setNotes} />
          <Text className="text-sm opacity-70">Tell us more about what was wrong</Text>
        </View>
        {error && <Text className="text-red-500">{error.message}</Text>}
        <Button onPress={handleSubmit} isLoading={isLoading}>
          Submit report
        </Button>
      </View>
    </ScrollView>
  )
}

function ReportLink({
  title,
  description,
  onPress,
  hasChanged,
}: {
  title: string
  description: string
  onPress: () => void
  hasChanged: boolean
}) {
  return (
    <TouchableOpacity className="flex flex-row items-center justify-between py-1" onPress={onPress}>
      <View>
        <Text className="h-6 text-lg">{title}</Text>
        <Text className="text-sm opacity-70">{description}</Text>
      </View>
      <Icon icon={ChevronRight} size={24} color={hasChanged ? "primary" : undefined} />
    </TouchableOpacity>
  )
}
