import * as React from "react"
import { TextInput, TouchableOpacity, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useQuery } from "@tanstack/react-query"
import { Search, X } from "lucide-react-native"

import { Icon } from "../../../components/Icon"
import { Button } from "../../../components/ui/Button"
import { FULL_WEB_URL } from "../../../lib/config"
import { width } from "../../../lib/device"
import { Spinner } from "../../../components/ui/Spinner"

export function MapSearch({ onSearch }: { onSearch: (center: [number, number]) => void }) {
  const [search, setSearch] = React.useState("")

  const searchWidth = useSharedValue(0)
  const animatedStyles = useAnimatedStyle(() => ({
    width: withTiming(searchWidth.value, { duration: 100 }),
  }))

  const { data, isLoading, isFetching } = useQuery({
    enabled: !!search,
    queryKey: ["map-search", { search }],
    queryFn: async () => {
      const res = await fetch(`${FULL_WEB_URL}/api/mapbox/location-search?search=${search}`)
      return res.json() as Promise<{ name: string; center: [number, number] }[]>
    },
    keepPreviousData: true,
  })

  const onClear = () => {
    setSearch("")
    searchWidth.value = 0
  }

  const inputRef = React.useRef<TextInput>(null)

  return (
    <>
      {data && !!search && (
        <View className="bg-background dark:bg-background-dark absolute left-4 right-4 top-14 rounded-[24px] p-3 pt-12">
          {data.map((item) => (
            <Button
              onPress={() => {
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
      )}
      <Animated.View
        style={[animatedStyles]}
        className="bg-background dark:bg-background-dark absolute left-4 top-14 flex h-12 flex-row items-center justify-between overflow-hidden rounded-full pl-12 shadow-lg"
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
          className="sq-12 bg-background dark:bg-background-dark  flex flex-row items-center justify-center rounded-full"
        >
          <Icon icon={X} size={22} />
        </TouchableOpacity>
      </Animated.View>
      <View pointerEvents="box-none" className="absolute left-4 top-14 flex flex-row items-center">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            searchWidth.value = width - 32
          }}
          className="sq-12 bg-background dark:bg-background-dark flex flex-row items-center justify-center rounded-full"
        >
          {isLoading || isFetching ? <Spinner /> : <Icon icon={Search} size={22} />}
        </TouchableOpacity>
      </View>
    </>
  )
}
