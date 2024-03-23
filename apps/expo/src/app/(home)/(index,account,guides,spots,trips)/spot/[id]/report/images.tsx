import { Image } from "expo-image"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Flag } from "lucide-react-native"
import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"

import { createAssetUrl, join } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { api } from "~/lib/api"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { ReportSpotModalView } from "./ReportSpotModalView"

export default function SpotReportImagesScreen() {
  const { id, ...params } = useLocalSearchParams<{ id: string; flaggedImageIds: string }>()
  const { data: spot } = api.spot.report.useQuery({ id })
  const router = useRouter()
  const [flaggedImageIds, setFlaggedImageIds] = React.useState<string[]>(params.flaggedImageIds.split(",") || [])

  const isFlagged = (id: string) => {
    return !!flaggedImageIds.find((flaggedImageId) => flaggedImageId === id)
  }
  const handleClickImage = (id: string) => {
    if (isFlagged(id)) {
      const newImages = flaggedImageIds.filter((flaggedImageId) => flaggedImageId !== id)
      setFlaggedImageIds(newImages)
    } else {
      setFlaggedImageIds([id, ...flaggedImageIds])
    }
  }

  const tab = useTabSegment()
  const handleClose = () => {
    router.navigate(`/${tab}/spot/${id}/report?${new URLSearchParams({ ...params, flaggedImageIds: flaggedImageIds.join(",") })}`)
  }

  if (!spot) return null
  return (
    <ReportSpotModalView title="images">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="flex flex-row flex-wrap gap-2 py-4">
          <View className="flex-row flex-wrap space-y-2">
            {spot.images.map(({ id, path }) => (
              <View key={id} className="w-full">
                <TouchableOpacity onPress={() => handleClickImage(id)}>
                  <Image
                    className={join(
                      "h-[200px] w-full rounded-xs bg-gray-50 object-cover dark:bg-gray-700",
                      isFlagged(id) && "opacity-80 outline outline-red-500 outline-solid",
                    )}
                    source={{ uri: createAssetUrl(path) }}
                  />
                </TouchableOpacity>
                <View className="absolute top-2 left-2 z-10">
                  <Button
                    onPress={() => handleClickImage(id)}
                    size="sm"
                    variant={isFlagged(id) ? "destructive" : "secondary"}
                    leftIcon={<Icon icon={Flag} size={18} color={isFlagged(id) ? "white" : undefined} />}
                  >
                    {isFlagged(id) ? "Flagged" : "Flag"}
                  </Button>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View pointerEvents="box-none" className="absolute right-0 bottom-0 left-0 bg-background p-4 pb-10 dark:bg-background-dark">
        <Button className="w-full" onPress={handleClose}>
          Done
        </Button>
      </View>
    </ReportSpotModalView>
  )
}
