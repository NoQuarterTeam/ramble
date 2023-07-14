import * as React from "react"
import { ScrollView, View } from "react-native"

import { type SpotType } from "@ramble/database/types"
import { join } from "@ramble/shared"

import { Button } from "../../../../../components/ui/Button"
import { SPOT_OPTIONS } from "../../../../../lib/spots"
import { useParams, useRouter } from "../../../../router"
import { NewModalView } from "./NewModalView"

export function NewSpotTypeScreen() {
  const { params } = useParams<"NewSpotTypeScreen">()
  const [type, setType] = React.useState<SpotType>()
  const router = useRouter()
  return (
    <NewModalView title="What type?">
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
      {type && (
        <View className="absolute bottom-12 left-4 flex space-y-2 right-4 items-center justify-center">
          <Button
            // leftIcon={<X size={20} className="text-black dark:text-white" />}
            className="rounded-full"
            onPress={() => router.push("NewSpotOptionsScreen", { ...params, type })}
          >
            Next
          </Button>
        </View>
      )}
    </NewModalView>
  )
}
