import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Button } from "./ui/Button"
import { Image } from "expo-image"
import { BrandHeading } from "./ui/BrandHeading"
import { Icon } from "./Icon"
import { Flag, X } from "lucide-react-native"
import { createImageUrl, join } from "@ramble/shared"

interface Props {
  images: string[]
  flaggedImages: string[]
  setFlaggedImages: React.Dispatch<React.SetStateAction<string[]>>
  handleClose: () => void
}

export function ReportSpotEditImages({ images, flaggedImages, setFlaggedImages, handleClose }: Props) {
  const isFlagged = (image: string) => {
    return !!flaggedImages.find((flaggedImage) => flaggedImage === image)
  }
  const handleClickImage = (image: string) => {
    if (isFlagged(image)) {
      const newImages = flaggedImages.filter((flaggedImage) => flaggedImage !== image)
      setFlaggedImages(newImages)
    } else {
      setFlaggedImages([image, ...flaggedImages])
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
            {images.map((image) => {
              const base = "rounded-xs h-[200px] w-full bg-gray-50 object-cover dark:bg-gray-700"
              const className = join(base, isFlagged(image) && "outline-solid opacity-80 outline outline-red-500")
              return (
                <View key={image} className="w-full">
                  <TouchableOpacity onPress={() => handleClickImage(image)}>
                    <Image className={className} source={{ uri: image.startsWith("file://") ? image : createImageUrl(image) }} />
                  </TouchableOpacity>
                  <View className="absolute left-2 top-2 z-10">
                    <Button
                      size="sm"
                      variant={isFlagged(image) ? "destructive" : "secondary"}
                      leftIcon={<Flag size={18} color={isFlagged(image) ? "white" : "black"} />}
                    >
                      {isFlagged(image) ? "Flagged" : "Flag"}
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
