import { useLocalSearchParams, useRouter } from "expo-router"
import * as React from "react"
import { ScrollView, View } from "react-native"

import type { SpotType } from "@ramble/database/types"
import { SPOT_TYPE_OPTIONS } from "@ramble/shared"

import { SpotIcon } from "~/components/SpotIcon"
import { Button } from "~/components/ui/Button"
import { Text } from "~/components/ui/Text"

import { NewSpotModalView } from "./NewSpotModalView"

export default function NewSpotTypeScreen() {
  const params = useLocalSearchParams<{ type?: SpotType }>()
  const router = useRouter()
  const [type, setType] = React.useState(params.type)

  return (
    <NewSpotModalView title="select a type">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Text className="text-sm opacity-70 mb-1">Stay</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_TYPE_OPTIONS.filter((s) => s.category === "STAY").map((spotType) => (
              <Button
                size="sm"
                variant={type === spotType.value ? "primary" : "outline"}
                leftIcon={
                  <SpotIcon
                    type={spotType.value}
                    size={20}
                    color={{
                      light: type === spotType.value ? "white" : "black",
                      dark: type === spotType.value ? "black" : "white",
                    }}
                  />
                }
                key={spotType.value}
                onPress={() => setType(spotType.value)}
              >
                {spotType.label}
              </Button>
            ))}
          </View>
        </View>
        <View className="pb-4">
          <Text className="text-sm opacity-70 mb-1">Activity</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_TYPE_OPTIONS.filter((s) => s.category === "ACTIVITY").map((spotType) => (
              <Button
                size="sm"
                variant={type === spotType.value ? "primary" : "outline"}
                leftIcon={
                  <SpotIcon
                    type={spotType.value}
                    size={20}
                    color={{
                      light: type === spotType.value ? "white" : "black",
                      dark: type === spotType.value ? "black" : "white",
                    }}
                  />
                }
                key={spotType.value}
                onPress={() => setType(spotType.value)}
              >
                {spotType.label}
              </Button>
            ))}
          </View>
        </View>
        <View className="pb-4">
          <Text className="text-sm opacity-70 mb-1">Service</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_TYPE_OPTIONS.filter((s) => s.category === "SERVICE").map((spotType) => (
              <Button
                size="sm"
                variant={type === spotType.value ? "primary" : "outline"}
                leftIcon={
                  <SpotIcon
                    type={spotType.value}
                    size={20}
                    color={{
                      light: type === spotType.value ? "white" : "black",
                      dark: type === spotType.value ? "black" : "white",
                    }}
                  />
                }
                key={spotType.value}
                onPress={() => setType(spotType.value)}
              >
                {spotType.label}
              </Button>
            ))}
          </View>
        </View>
        <View className="pb-4">
          <Text className="text-sm opacity-70 mb-1">Hospitality</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_TYPE_OPTIONS.filter((s) => s.category === "HOSPITALITY").map((spotType) => (
              <Button
                size="sm"
                variant={type === spotType.value ? "primary" : "outline"}
                leftIcon={
                  <SpotIcon
                    type={spotType.value}
                    size={20}
                    color={{
                      light: type === spotType.value ? "white" : "black",
                      dark: type === spotType.value ? "black" : "white",
                    }}
                  />
                }
                key={spotType.value}
                onPress={() => setType(spotType.value)}
              >
                {spotType.label}
              </Button>
            ))}
          </View>
        </View>
        <View className="pb-4">
          <Text className="text-sm opacity-70 mb-1">Other</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_TYPE_OPTIONS.filter((s) => s.category === "OTHER").map((spotType) => (
              <Button
                size="sm"
                variant={type === spotType.value ? "primary" : "outline"}
                leftIcon={
                  <SpotIcon
                    type={spotType.value}
                    size={20}
                    color={{
                      light: type === spotType.value ? "white" : "black",
                      dark: type === spotType.value ? "black" : "white",
                    }}
                  />
                }
                key={spotType.value}
                onPress={() => setType(spotType.value)}
              >
                {spotType.label}
              </Button>
            ))}
          </View>
        </View>
        <Text className="text-center text-sm opacity-80">More options coming soon</Text>
      </ScrollView>
      {type && (
        <View className="absolute right-4 bottom-12 left-4 flex items-center justify-center space-y-2">
          <Button
            size="sm"
            onPress={() => {
              const searchParams = new URLSearchParams({ ...params, type })
              // @ts-ignore
              router.push(`/new/info?${searchParams}`)
            }}
          >
            Continue as {SPOT_TYPE_OPTIONS.find((spotType) => spotType.value === type)?.label}
          </Button>
        </View>
      )}
    </NewSpotModalView>
  )
}
