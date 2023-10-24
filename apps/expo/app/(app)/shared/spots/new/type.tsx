import * as React from "react"
import { ScrollView, View } from "react-native"

import { type SpotType } from "@ramble/database/types"

import { Button } from "../../../../../components/ui/Button"
import { Text } from "../../../../../components/ui/Text"
import { SPOT_OPTIONS } from "../../../../../lib/models/spot"
import { useParams, useRouter } from "../../../../router"
import { NewSpotModalView } from "./NewSpotModalView"
import { Icon } from "../../../../../components/Icon"

export function NewSpotTypeScreen() {
  const { params } = useParams<"NewSpotTypeScreen">()
  const [type, setType] = React.useState<SpotType>()
  const router = useRouter()
  return (
    <NewSpotModalView title="what type?">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex flex-row flex-wrap gap-2 py-4">
          {SPOT_OPTIONS.filter((s) => !s.isComingSoon).map((spotType) => (
            <Button
              size="sm"
              variant={type === spotType.value ? "primary" : "outline"}
              leftIcon={
                <Icon
                  icon={spotType.Icon}
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
          <Button className="rounded-full" onPress={() => router.push("NewSpotOptionsScreen", { ...params, type })}>
            Next
          </Button>
        </View>
      )}
    </NewSpotModalView>
  )
}
