import { useLocalSearchParams, useRouter } from "expo-router"
import { ChevronRight } from "lucide-react-native"
import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"

import type { SpotType } from "@ramble/database/types"
import { isCampingSpot } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { FormInputLabel } from "~/components/ui/FormInput"
import { Input } from "~/components/ui/Input"
import { ModalView } from "~/components/ui/ModalView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { type RouterOutputs, api } from "~/lib/api"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

export default function SpotReportScreen() {
  const params = useLocalSearchParams<{ id: string }>()

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

type Params = {
  id: string
  name: string
  description: string
  latitude: string
  longitude: string
  type: SpotType
  images: string
  amenities: string
  isPetFriendly: string
  flaggedImageIds: string
  isLocationUnknown: string
}

function ReportFlow({ spot }: Props) {
  const router = useRouter()
  const { id, ...params } = useLocalSearchParams<{ id: string } & Params>()

  const data = {
    name: params.name || spot.name,
    description: params.description || spot.description,
    isPetFriendly: params.isPetFriendly ? params.isPetFriendly === "true" : spot.isPetFriendly,
    type: params.type || spot.type,
    amenities: params.amenities ? JSON.parse(params.amenities) : spot.amenities,
    flaggedImageIds: params.flaggedImageIds ? params.flaggedImageIds.split(",") : [],
    latitude: params.latitude ? Number(params.latitude) : spot.latitude,
    longitude: params.longitude ? Number(params.longitude) : spot.longitude,
    isLocationUnknown: params.isLocationUnknown ? params.isLocationUnknown === "true" : false,
  }

  const [notes, setNotes] = React.useState("")

  const { mutate, isLoading, error } = api.spotRevision.create.useMutation({
    onSuccess: async () => {
      router.navigate(`/${tab}/spot/${id}`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({ title: "Report submitted", message: "Thank you for making Ramble even better!" })
    },
    onError: () => {
      toast({ type: "error", title: "Error submitting report" })
    },
  })

  const handleSubmit = () => {
    const revisionNotes = {
      ...data,
      flaggedImageIds: params.flaggedImageIds,
      notes,
    }
    mutate({ spotId: spot.id, notes: JSON.stringify(revisionNotes) })
  }

  const tab = useTabSegment()

  const dataToParams = {
    name: params.name || spot.name,
    description: params.description || spot.description || "",
    isPetFriendly: params.isPetFriendly || spot.isPetFriendly.toString(),
    type: params.type || spot.type,
    amenities: params.amenities || JSON.stringify(spot.amenities),
    flaggedImageIds: params.flaggedImageIds || "",
    latitude: params.latitude || spot.latitude.toString(),
    longitude: params.longitude || spot.longitude.toString(),
    isLocationUnknown: params.isLocationUnknown || "",
  }
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
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
          onPress={() => router.push(`/${tab}/spot/${spot.id}/report/info?${new URLSearchParams(dataToParams)}`)}
        />
        <ReportLink
          title="Location"
          description="the location is incorrect"
          hasChanged={data.latitude !== spot.latitude || data.longitude !== spot.longitude}
          onPress={() => router.push(`/${tab}/spot/${spot.id}/report/location?${new URLSearchParams(dataToParams)}`)}
        />
        <ReportLink
          title="Type"
          description="the spot is a different type"
          hasChanged={data.type !== spot.type}
          onPress={() => router.push(`/${tab}/spot/${spot.id}/report/type?${new URLSearchParams(dataToParams)}`)}
        />

        {isCampingSpot(data.type) && (
          <ReportLink
            title="Amenities"
            description="the amenities are incorrect"
            onPress={() => router.push(`/${tab}/spot/${spot.id}/report/amenities?${new URLSearchParams(dataToParams)}`)}
            hasChanged={
              data.amenities && spot.amenities
                ? !!Object.keys(data.amenities).find(
                    (key) =>
                      data.amenities?.[key as keyof typeof data.amenities] !==
                      spot.amenities?.[key as keyof typeof spot.amenities],
                  )
                : false
            }
          />
        )}
        <ReportLink
          title="Images"
          description="the images are inaccurate or inappropriate"
          hasChanged={params.flaggedImageIds ? params.flaggedImageIds.length !== 0 : false}
          onPress={() => router.push(`/${tab}/spot/${spot.id}/report/images?${new URLSearchParams(dataToParams)}`)}
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
