import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image"
import { Flag } from "lucide-react-native"

import { createImageUrl, join } from "@ramble/shared"

import { Icon } from "../../../../../components/Icon"
import { Button } from "../../../../../components/ui/Button"
import { useParams, useRouter } from "../../../../router"
import { ReportSpotModalView } from "./ReportSpotModalView"

export function SpotReportImagesScreen() {
  const { params } = useParams<"SpotReportImagesScreen">()
  const router = useRouter()
  const [flaggedImageIds, setFlaggedImageIds] = React.useState<string[]>(params.flaggedImageIds || [])

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

  const handleClose = () => {
    router.navigate("SpotReportScreen", { ...params, flaggedImageIds })
  }

  return (
    <ReportSpotModalView title="images">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="flex flex-row flex-wrap gap-2 py-4">
          <View className="flex-row flex-wrap space-y-2">
            {params.images.map(({ id, path }) => (
              <View key={id} className="w-full">
                <TouchableOpacity onPress={() => handleClickImage(id)}>
                  <Image
                    className={join(
                      "rounded-xs h-[200px] w-full bg-gray-50 object-cover dark:bg-gray-700",
                      isFlagged(id) && "outline-solid opacity-80 outline outline-red-500",
                    )}
                    source={{ uri: createImageUrl(path) }}
                  />
                </TouchableOpacity>
                <View className="absolute left-2 top-2 z-10">
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
      <View pointerEvents="box-none" className="bg-background dark:bg-background-dark absolute bottom-0 left-0 right-0 p-4 pb-10">
        <Button className="w-full" onPress={handleClose}>
          Done
        </Button>
      </View>
    </ReportSpotModalView>
  )
}
