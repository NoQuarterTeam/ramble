import * as React from "react"
import { ScrollView, View } from "react-native"

import { type SpotType } from "@ramble/database/types"
import { SPOT_TYPE_OPTIONS } from "@ramble/shared"

import { SpotIcon } from "~/components/SpotIcon"
import { Button } from "~/components/ui/Button"
import { Text } from "~/components/ui/Text"

import { NewSpotModalView } from "./NewSpotModalView"
import { useGlobalSearchParams, useRouter } from "expo-router"

export default function NewSpotTypeScreen() {
  const params = useGlobalSearchParams<any>()
  const router = useRouter()
  const [type, setType] = React.useState<SpotType>()
  return (
    <NewSpotModalView title="what type?">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex flex-row flex-wrap gap-2 py-4">
          {SPOT_TYPE_OPTIONS.filter((s) => !s.isComingSoon).map((spotType) => (
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
        <Text className="text-center text-sm opacity-80">More options coming soon</Text>
      </ScrollView>
      {type && (
        <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
          <Button className="rounded-full" onPress={() => router.push("NewSpotInfoScreen", { ...params, type })}>
            Next
          </Button>
        </View>
      )}
    </NewSpotModalView>
  )
}
