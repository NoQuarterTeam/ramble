import AsyncStorage from "@react-native-async-storage/async-storage"
import { Link, useRouter } from "expo-router"
import { BadgeX, Dog } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { Switch, View } from "react-native"
import { ScrollView } from "react-native"
import { z } from "zod"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { SpotType } from "@ramble/database/types"
import { SPOT_TYPES, SPOT_TYPE_OPTIONS, type SpotTypeInfo, join } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { Heading } from "~/components/ui/Heading"
import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { useMe } from "~/lib/hooks/useMe"
import { SPOT_TYPE_ICONS } from "~/lib/models/spot"

const mapFiltersSchema = z.object({
  types: z.array(z.string()),
  isPetFriendly: z.boolean(),
  isUnverified: z.boolean(),
})

// hack to force types
export type MapFiltersOptions = Omit<z.infer<typeof mapFiltersSchema>, "types"> & { types: SpotType[] }

export const initialFilters = {
  isPetFriendly: false,
  isUnverified: false,
  types: ["CAMPING", "VAN_PARK", "REWILDING"],
} satisfies MapFiltersOptions

export const useMapFilters = create<{
  filters: MapFiltersOptions
  setFilters: (filter: Partial<MapFiltersOptions>) => void
}>()(
  persist(
    (set) => ({
      filters: initialFilters,
      setFilters: (filter) => set((state) => ({ filters: { ...state.filters, ...filter } })),
    }),
    { name: "ramble.map.filters", storage: createJSONStorage(() => AsyncStorage) },
  ),
)

export default function MapFilters() {
  const initialState = useMapFilters()
  const [filters, setFilters] = React.useState(initialState.filters)
  const router = useRouter()
  const posthog = usePostHog()

  const { me } = useMe()
  return (
    <ModalView title="map filters">
      <View className="flex-1 pb-10">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          className="space-y-5"
        >
          <View className="space-y-2">
            {!me && (
              <View className="flex flex-row space-x-1">
                <Link href="/register" push asChild>
                  <Text className="text-base underline">Sign up</Text>
                </Link>
                <Text className="text-base">to access more filters</Text>
              </View>
            )}
            <View>
              <SpotTypeSection
                {...{ filters, setFilters }}
                title="Stays"
                types={SPOT_TYPE_OPTIONS.filter((s) => s.category === "STAY").map((s) => s.value)}
              />
            </View>
            <View>
              <SpotTypeSection
                {...{ filters, setFilters }}
                title="Activities"
                types={SPOT_TYPE_OPTIONS.filter((s) => s.category === "ACTIVITY").map((s) => s.value)}
              />
            </View>
            <View>
              <SpotTypeSection
                {...{ filters, setFilters }}
                title="Services"
                types={SPOT_TYPE_OPTIONS.filter((s) => s.category === "SERVICE").map((s) => s.value)}
              />
            </View>
            <View>
              <SpotTypeSection
                {...{ filters, setFilters }}
                title="Hospitality"
                types={SPOT_TYPE_OPTIONS.filter((s) => s.category === "HOSPITALITY").map((s) => s.value)}
              />
            </View>
            <View>
              <SpotTypeSection
                {...{ filters, setFilters }}
                title="Other"
                types={SPOT_TYPE_OPTIONS.filter((s) => s.category === "OTHER").map((s) => s.value)}
              />
            </View>
          </View>

          <View className="space-y-2">
            <Heading className="font-400 text-2xl">Options</Heading>
            <View className="flex flex-row items-center justify-between space-x-4">
              <View className="flex flex-row items-center space-x-4">
                <Icon icon={BadgeX} size={30} />
                <View>
                  <Text className="text-lg">Unverified spots</Text>
                  <Text className="text-sm opacity-75">Spots not yet verified by a Guide</Text>
                </View>
              </View>
              <Switch
                disabled={!me}
                trackColor={{ true: colors.primary[600] }}
                value={filters.isUnverified}
                onValueChange={() => setFilters((f) => ({ ...f, isUnverified: !f.isUnverified }))}
              />
            </View>
            <View className="flex flex-row items-center justify-between space-x-4">
              <View className="flex flex-row items-center space-x-4">
                <Icon icon={Dog} size={30} />
                <View>
                  <Text className="text-lg">Suitable for pets</Text>
                  <Text className="text-sm opacity-75">Furry friends allowed</Text>
                </View>
              </View>
              <Switch
                disabled={!me}
                trackColor={{ true: colors.primary[600] }}
                value={filters.isPetFriendly}
                onValueChange={() => setFilters((f) => ({ ...f, isPetFriendly: !f.isPetFriendly }))}
              />
            </View>
          </View>
        </ScrollView>
        <View ph-no-capture className="flex flex-row justify-between pt-4">
          <Button
            variant="link"
            onPress={() => {
              posthog.capture("map filters reset")
              initialState.setFilters(initialFilters)
              router.back()
            }}
          >
            Reset
          </Button>
          <Button
            className="w-[120px]"
            onPress={() => {
              posthog.capture("map filters changed", { ...filters, types: filters.types.join(", ") })
              initialState.setFilters(filters)
              router.back()
            }}
          >
            Save filters
          </Button>
        </View>
      </View>
    </ModalView>
  )
}

function SpotTypeSection({
  title,
  types,
  filters,
  setFilters,
}: {
  title: string
  types: SpotType[]
  filters: MapFiltersOptions
  setFilters: (filters: MapFiltersOptions) => void
}) {
  return (
    <View>
      <Heading className="font-400 text-lg">{title}</Heading>
      <View className="flex flex-row flex-wrap gap-2">
        {types.map((type) => {
          const isSelected = filters.types.includes(type)
          return (
            <View key={type}>
              <SpotTypeSelector
                type={SPOT_TYPES[type]}
                isSelected={isSelected}
                onPress={() =>
                  setFilters({
                    ...filters,
                    types: isSelected ? filters.types.filter((t) => t !== type) : [...filters.types, type],
                  })
                }
              />
            </View>
          )
        })}
      </View>
    </View>
  )
}

function SpotTypeSelector({
  type,
  onPress,
  isSelected,
}: {
  type: SpotTypeInfo
  isSelected: boolean
  onPress: () => void
}) {
  const { me } = useMe()
  const router = useRouter()
  const isDisabled = me?.isAdmin ? false : type.isComingSoon
  return (
    <View className="relative">
      <Button
        size="sm"
        variant={isSelected ? "primary" : "outline"}
        leftIcon={
          <Icon
            icon={SPOT_TYPE_ICONS[type.value]}
            size={20}
            className={join(!me?.isAdmin && (type.isComingSoon || isDisabled) && "opacity-50")}
            color={{ light: isSelected ? "white" : "black", dark: isSelected ? "black" : "white" }}
          />
        }
        className="min-w-[100px]"
        disabled={(me && isDisabled) || false}
        onPress={() => {
          !me ? router.push("/register") : onPress()
        }}
      >
        <Text className={join(isSelected ? "text-white dark:text-black" : "text-black dark:text-white", !me && "opacity-70")}>
          {type.label}
        </Text>
      </Button>

      {!me?.isAdmin && type.isComingSoon && (
        <View
          className={join(
            "-right-1 -top-1 absolute flex h-[18px] w-[70px] items-center justify-center rounded-full border border-gray-300 bg-background dark:border-gray-700 dark:bg-background-dark",
          )}
        >
          <Text className="text-xxs leading-3">Coming soon</Text>
        </View>
      )}
    </View>
  )
}
