import * as React from "react"
import { ScrollView, View } from "react-native"

import { type SpotType } from "@ramble/database/types"
import { join } from "@ramble/shared"

import { Button } from "../../../../../../components/ui/Button"
import { SPOT_OPTIONS } from "../../../../../../lib/models/spot"
import { useParams, useRouter } from "../../../../../router"
import { EditSpotModalView } from "./EditSpotModalView"

export function EditSpotTypeScreen() {
  const { params } = useParams<"EditSpotTypeScreen">()
  const [type, setType] = React.useState<SpotType>(params.type)
  const router = useRouter()
  return (
    <EditSpotModalView title="what type?">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex flex-row flex-wrap gap-2 pt-4">
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
        <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
          <Button className="rounded-full" onPress={() => router.push("EditSpotOptionsScreen", { ...params, type })}>
            Next
          </Button>
        </View>
      )}
    </EditSpotModalView>
  )
}
