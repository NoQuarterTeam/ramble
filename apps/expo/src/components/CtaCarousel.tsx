import { merge } from "@ramble/shared"
import { Image } from "expo-image"
import * as React from "react"
import { Dimensions, TouchableOpacity, View } from "react-native"
import type { ICarouselInstance } from "react-native-reanimated-carousel"
import Carousel from "react-native-reanimated-carousel"
import { Text } from "~/components/ui/Text"

interface Props {
  items: { text: string; image: string }[]
}

export function CtaCarousel({ items }: Props) {
  const DEVICE_WIDTH = Dimensions.get("window").width
  const DEVICE_HEIGHT = Dimensions.get("window").height
  const IMAGE_HEIGHT = DEVICE_HEIGHT * 0.35
  const TEXT_HEIGHT = 70

  const ref = React.useRef<ICarouselInstance>(null)

  const [currentIndex, setCurrentIndex] = React.useState(0)

  return (
    <View>
      <Carousel
        ref={ref}
        loop={false}
        width={DEVICE_WIDTH - 32}
        height={IMAGE_HEIGHT + TEXT_HEIGHT}
        data={items}
        scrollAnimationDuration={200}
        overscrollEnabled
        onSnapToItem={(index) => setCurrentIndex(index)}
        renderItem={({ item }) => (
          <View className="flex items-center">
            <Text style={{ height: TEXT_HEIGHT }} className="px-8 text-center text-xl">
              {item.text}
            </Text>
            <Image style={{ height: IMAGE_HEIGHT, width: IMAGE_HEIGHT }} source={item.image} />
          </View>
        )}
      />
      <View className="flex flex-row justify-center space-x-4 my-8">
        {items.map((_, index) => (
          <TouchableOpacity
            key={index.toString()}
            className={merge(currentIndex === index ? "bg-primary" : "bg-gray-200", "w-[14px] h-[14px] rounded-full")}
            onPress={() => {
              ref.current?.scrollTo({ index })
              setCurrentIndex(index)
            }}
          />
        ))}
      </View>
    </View>
  )
}
