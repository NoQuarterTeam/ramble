import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Button } from "./ui/Button"
import { Image } from "expo-image"
import { BrandHeading } from "./ui/BrandHeading"
import { Icon } from "./Icon"
import { Flag, X } from "lucide-react-native"
import { createImageUrl, join } from "@ramble/shared"

interface Props {
  images: { id: string; path: string }[]
  flaggedImageIds: string[]
  setFlaggedImageIds: React.Dispatch<React.SetStateAction<string[]>>
  handleClose: () => void
}

export function ReportSpotEditImages({ images, flaggedImageIds, setFlaggedImageIds, handleClose }: Props) {
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

  return (
    <View className="space-y-6">
      <View className="flex flex-row justify-between pb-2">
        <BrandHeading className="text-3xl">Images</BrandHeading>
        <TouchableOpacity onPress={handleClose} className="p-1">
          <Icon icon={X} size={24} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="flex flex-row flex-wrap gap-2 py-4">
          <View className="flex-row flex-wrap space-y-2">
            {images.map(({ id, path }) => {
              const base = "rounded-xs h-[200px] w-full bg-gray-50 object-cover dark:bg-gray-700"
              const className = join(base, isFlagged(id) && "outline-solid opacity-80 outline outline-red-500")
              return (
                <View key={id} className="w-full">
                  <TouchableOpacity onPress={() => handleClickImage(id)}>
                    <Image className={className} source={{ uri: path.startsWith("file://") ? path : createImageUrl(path) }} />
                  </TouchableOpacity>
                  <View className="absolute left-2 top-2 z-10">
                    <Button
                      size="sm"
                      variant={isFlagged(id) ? "destructive" : "secondary"}
                      leftIcon={<Flag size={18} color={isFlagged(id) ? "white" : "black"} />}
                    >
                      {isFlagged(id) ? "Flagged" : "Flag"}
                    </Button>
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      </ScrollView>
      <View className="bg-background dark:bg-background-dark absolute bottom-8 flex h-[100px] w-full pt-2">
        <Button className="w-full" onPress={handleClose}>
          Next
        </Button>
      </View>
    </View>
  )
}
