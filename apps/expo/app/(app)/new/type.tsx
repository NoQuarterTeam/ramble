import * as React from "react"
import { ScrollView, View } from "react-native"
import { X } from "lucide-react-native"

import { type SpotType } from "@ramble/database/types"
import { join } from "@ramble/shared"

import { Button } from "../../../components/ui/Button"
import { ScreenView } from "../../../components/ui/ScreenView"
import { SPOT_OPTIONS } from "../../../lib/spots"
import { useParams, useRouter } from "../../router"

export function NewSpotTypeScreen() {
  const { params } = useParams<"NewSpotTypeScreen">()
  const [type, setType] = React.useState<SpotType>()
  const router = useRouter()
  return (
    <ScreenView
      title="What type?"
      rightElement={
        type && (
          <Button size="sm" variant="link" onPress={() => router.push("NewSpotOptionsScreen", { ...params, type })}>
            Next
          </Button>
        )
      }
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="pt-4 flex flex-row flex-wrap gap-2">
          {SPOT_OPTIONS.map((spotType) => (
            <Button
              variant={type === spotType.value ? "primary" : "outline"}
              leftIcon={
                <spotType.Icon
                  size={20}
                  className={join(type === spotType.value ? "text-white dark:text-black" : "text-black dark:text-white")}
                />
              }
              key={spotType.value}
              onPress={() => setType(spotType.value)}
            >
              {spotType.label}
            </Button>
          ))}
        </View>
      </ScrollView>
      <View className="absolute bottom-4 left-4 flex flex-row right-4 items-center justify-center">
        <Button
          variant="secondary"
          leftIcon={<X size={20} className="text-black dark:text-white" />}
          className="rounded-full"
          size="sm"
          onPress={router.popToTop}
        >
          Cancel
        </Button>
      </View>
    </ScreenView>
  )
}
