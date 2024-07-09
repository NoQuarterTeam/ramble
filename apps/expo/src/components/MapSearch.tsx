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
    width: withTiming(searchWidth.value, { duration: 200 }),
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
        <SafeAreaView edges={["top"]} className="absolute top-14 right-4 left-4">
          <View className="rounded-sm bg-background dark:bg-background-dark">
            {data.map((item) => (
              <Button
                onPress={() => {
                  posthog.capture("map location searched", { search: item.name })
                  onSearch(item.center)
                  onClear()
                }}
                key={item.name}
                variant="ghost"
                textClassName="text-sm text-left"
                className="h-auto bg-background dark:bg-background-dark w-full justify-start py-1"
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
          className="flex h-10 flex-row items-center justify-between overflow-hidden rounded-sm bg-background pl-10 shadow-lg dark:bg-background-dark"
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            ref={inputRef}
            placeholder="Search a location"
            className="font-500 pl-2 text-black bg-background dark:bg-background-dark dark:text-white"
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClear}
            className="sq-10 flex flex-row items-center justify-center rounded-sm bg-background dark:bg-background-dark"
          >
            <Icon icon={X} size={20} />
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
          className="sq-10 shadow flex flex-row items-center justify-center rounded-sm bg-background dark:bg-background-dark"
        >
          {isFetching ? <Spinner /> : <Icon icon={Search} size={20} />}
        </TouchableOpacity>
      </SafeAreaView>
    </>
  )
}
