import { useLocalSearchParams, useRouter } from "expo-router"
import * as React from "react"
import { ScrollView, View } from "react-native"

import type { SpotType } from "@ramble/database/types"
import { SPOT_TYPE_OPTIONS } from "@ramble/shared"

import { SpotIcon } from "~/components/SpotIcon"
import { Button } from "~/components/ui/Button"
import { Text } from "~/components/ui/Text"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { useMe } from "~/lib/hooks/useMe"
import { EditSpotModalView } from "./EditSpotModalView"

export default function EditSpotTypeScreen() {
  const { id, ...params } = useLocalSearchParams<{ id: string; type: string }>()
  const [type, setType] = React.useState<SpotType>(params.type as SpotType)
  const router = useRouter()
  const { me } = useMe()
  const tab = useTabSegment()
  return (
    <EditSpotModalView title="select a type">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Text className="text-sm opacity-70 mb-1">Stay</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_TYPE_OPTIONS.filter((s) => s.category === "STAY" && (me?.isAdmin ? true : !s.isComingSoon)).map((spotType) => (
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
            {SPOT_TYPE_OPTIONS.filter((s) => s.category === "ACTIVITY" && (me?.isAdmin ? true : !s.isComingSoon)).map(
              (spotType) => (
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
              ),
            )}
          </View>
        </View>
        <View className="pb-4">
          <Text className="text-sm opacity-70 mb-1">Service</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_TYPE_OPTIONS.filter((s) => s.category === "SERVICE" && (me?.isAdmin ? true : !s.isComingSoon)).map(
              (spotType) => (
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
              ),
            )}
          </View>
        </View>
        <View className="pb-4">
          <Text className="text-sm opacity-70 mb-1">Hospitality</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_TYPE_OPTIONS.filter((s) => s.category === "HOSPITALITY" && (me?.isAdmin ? true : !s.isComingSoon)).map(
              (spotType) => (
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
              ),
            )}
          </View>
        </View>
        <View className="pb-4">
          <Text className="text-sm opacity-70 mb-1">Other</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {SPOT_TYPE_OPTIONS.filter((s) => s.category === "OTHER" && (me?.isAdmin ? true : !s.isComingSoon)).map((spotType) => (
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
            className="rounded-full"
            onPress={() => {
              const searchParams = new URLSearchParams({ ...params, type })
              router.push(`/${tab}/spot/${id}/edit/info?${searchParams}`)
            }}
          >
            Continue as {SPOT_TYPE_OPTIONS.find((spotType) => spotType.value === type)?.label}
          </Button>
        </View>
      )}
    </EditSpotModalView>
  )
}
