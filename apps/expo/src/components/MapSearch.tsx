import { Search, X } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { Keyboard, TextInput, TouchableOpacity, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { Spinner } from "~/components/ui/Spinner"
import { api } from "~/lib/api"
import { width } from "~/lib/device"

export function MapSearch({ onSearch }: { onSearch: (center: [number, number]) => void }) {
  const [search, setSearch] = React.useState("")

  const searchWidth = useSharedValue(0)
  const animatedStyles = useAnimatedStyle(() => ({
    width: withTiming(searchWidth.value, { duration: 100 }),
  }))

  const { data, isFetching } = api.mapbox.getPlaces.useQuery({ search }, { enabled: !!search })
  const onClear = () => {
    setSearch("")
    inputRef.current?.blur()
    Keyboard.dismiss()
    searchWidth.value = 0
  }
  const posthog = usePostHog()

  const inputRef = React.useRef<TextInput>(null)

  return (
    <>
      {data && !!search && (
        <SafeAreaView edges={["top"]} className="absolute top-2 right-4 left-4">
          <View className="rounded-[24px] bg-gray-50 p-2 dark:bg-gray-900">
            {data.map((item) => (
              <Button
                onPress={() => {
                  posthog.capture("map location searched", { search: item.name })
                  onSearch(item.center)
                  onClear()
                }}
                key={item.name}
                variant="ghost"
                className="h-auto w-full justify-start py-2 text-left"
              >
                {item.name}
              </Button>
            ))}
          </View>
        </SafeAreaView>
      )}
      <SafeAreaView edges={["top"]} pointerEvents="box-none" className="absolute top-2 left-4">
        <Animated.View
          style={[animatedStyles]}
          className="flex h-12 flex-row items-center justify-between overflow-hidden rounded-full bg-background pl-12 shadow-lg dark:bg-background-dark"
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            ref={inputRef}
            placeholder="Search a location"
            className="font-500 text-black dark:text-white"
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClear}
            className="sq-12 flex flex-row items-center justify-center rounded-full bg-background dark:bg-background-dark"
          >
            <Icon icon={X} size={22} />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
      <SafeAreaView edges={["top"]} pointerEvents="box-none" className="absolute top-2 left-4">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            searchWidth.value = width - 32
            inputRef.current?.focus()
          }}
          className="sq-12 shadow flex flex-row items-center justify-center rounded-full bg-background dark:bg-background-dark"
        >
          {isFetching ? <Spinner /> : <Icon icon={Search} size={22} />}
        </TouchableOpacity>
      </SafeAreaView>
    </>
  )
}
