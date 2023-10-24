import * as React from "react"
import { ScrollView, Switch, useColorScheme, View } from "react-native"
import { BadgeX, Dog } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"
import { join } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Button } from "../../../components/ui/Button"
import { Heading } from "../../../components/ui/Heading"
import { Text } from "../../../components/ui/Text"
import { SPOT_TYPES, type SpotTypeInfo } from "../../../lib/models/spot"
import { Icon } from "../../../components/Icon"

export type Filters = {
  isPetFriendly: boolean
  isUnverified: boolean
  types: SpotType[]
}

export const initialFilters = {
  isPetFriendly: false,
  isUnverified: false,
  types: [],
} satisfies Filters

interface Props {
  initialFilters: Filters
  onSave: (filters: Filters) => void
}

export function MapFilters(props: Props) {
  const [filters, setFilters] = React.useState(props.initialFilters)
  return (
    <View className="flex-1 pb-10 pt-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} className="space-y-5">
        <View className="space-y-2">
          <View>
            <SpotTypeSection {...{ filters, setFilters }} title="Stays" types={["CAMPING", "FREE_CAMPING", "PARKING"]} />
          </View>
          <View>
            <SpotTypeSection
              {...{ filters, setFilters }}
              title="Activities"
              types={["CLIMBING", "SURFING", "PADDLE_KAYAK", "HIKING_TRAIL", "MOUNTAIN_BIKING"]}
            />
          </View>
          <View>
            <SpotTypeSection
              {...{ filters, setFilters }}
              title="Services"
              types={["GAS_STATION", "ELECTRIC_CHARGE_POINT", "MECHANIC_PARTS", "VET"]}
            />
          </View>
          <View>
            <SpotTypeSection {...{ filters, setFilters }} title="Hospitality" types={["CAFE", "RESTAURANT", "SHOP", "BAR"]} />
          </View>
          <View>
            <SpotTypeSection
              {...{ filters, setFilters }}
              title="Other"
              types={["NATURE_EDUCATION", "ART_FILM_PHOTOGRAPHY", "VOLUNTEERING"]}
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
              trackColor={{ true: colors.primary[600] }}
              value={filters.isUnverified}
              onValueChange={() => setFilters((f) => ({ ...f, isUnverified: !f.isUnverified }))}
            />
          </View>
          <View className="flex flex-row items-center justify-between space-x-4">
            <View className="flex flex-row items-center space-x-4">
              <Icon icon={Dog} size={30} />
              <View>
                <Text className="text-lg">Pet friendly</Text>
                <Text className="text-sm opacity-75">Furry friends allowed</Text>
              </View>
            </View>
            <Switch
              trackColor={{ true: colors.primary[600] }}
              value={filters.isPetFriendly}
              onValueChange={() => setFilters((f) => ({ ...f, isPetFriendly: !f.isPetFriendly }))}
            />
          </View>
        </View>
      </ScrollView>
      <View className="flex flex-row justify-between pt-4">
        <Button variant="link" onPress={() => props.onSave(initialFilters)}>
          Clear all
        </Button>
        <Button className="w-[120px]" onPress={() => props.onSave(filters)}>
          Save filters
        </Button>
      </View>
    </View>
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
  filters: Filters
  setFilters: (filters: Filters) => void
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

function SpotTypeSelector({ type, onPress, isSelected }: { type: SpotTypeInfo; isSelected: boolean; onPress: () => void }) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  return (
    <View className="relative">
      <Button
        size="sm"
        variant={isSelected ? "primary" : "outline"}
        leftIcon={
          <Icon
            icon={type.Icon}
            size={20}
            color={{ light: isSelected ? "white" : "black", dark: isSelected ? "black" : "white" }}
          />
        }
        className="min-w-[100px]"
        disabled={type.isComingSoon}
        onPress={onPress}
      >
        {type.label}
      </Button>
      {type.isComingSoon && (
        <View
          className={join(
            "absolute -right-1 -top-1 flex w-[80px] items-center justify-center rounded-full border border-gray-300 px-1 dark:border-gray-700",
            isDark ? "bg-background-dark" : "bg-background",
          )}
        >
          <Text className="text-xxs">Coming soon</Text>
        </View>
      )}
    </View>
  )
}
