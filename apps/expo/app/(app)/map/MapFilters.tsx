import * as React from "react"
import { ScrollView, Switch, View } from "react-native"
import { BadgeCheck, Dog } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"
import { join } from "@ramble/shared"
import colors from "@ramble/tailwind-config/src/colors"

import { Button } from "../../../components/ui/Button"
import { Heading } from "../../../components/ui/Heading"
import { Text } from "../../../components/ui/Text"
import { SPOT_OPTIONS } from "../../../lib/static/spots"

export type Filters = {
  isPetFriendly: boolean
  isVerified: boolean
  types: SpotType[]
}

export const initialFilters = {
  isPetFriendly: false,
  isVerified: false,
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
        <View className="space-y-1">
          <Heading className="font-400 text-2xl">Spot type</Heading>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_OPTIONS.map((type) => {
              const isSelected = filters.types.includes(type.value)
              return (
                <Button
                  variant={isSelected ? "primary" : "outline"}
                  leftIcon={
                    <type.Icon
                      size={20}
                      className={join(isSelected ? "text-white dark:text-black" : "text-black dark:text-white")}
                    />
                  }
                  key={type.value}
                  onPress={() =>
                    setFilters((f) => ({
                      ...f,
                      types: isSelected ? f.types.filter((t) => t !== type.value) : [...f.types, type.value],
                    }))
                  }
                >
                  {type.label}
                </Button>
              )
            })}
          </View>
        </View>

        <View className="space-y-2">
          <Heading className="font-400 text-2xl">Options</Heading>
          <View className="flex flex-row items-center justify-between space-x-4">
            <View className="flex flex-row items-center space-x-4">
              <BadgeCheck size={30} className="text-black dark:text-white" />
              <View>
                <Text className="text-lg">Verified spots</Text>
                <Text className="text-sm opacity-75">Spots verified by an Guide</Text>
              </View>
            </View>
            <Switch
              trackColor={{ true: colors.primary[600] }}
              value={filters.isVerified}
              onValueChange={() => setFilters((f) => ({ ...f, isVerified: !f.isVerified }))}
            />
          </View>
          <View className="flex flex-row items-center justify-between space-x-4">
            <View className="flex flex-row items-center space-x-4">
              <Dog size={30} className="text-black dark:text-white" />
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
      <View className="flex flex-row justify-between">
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
