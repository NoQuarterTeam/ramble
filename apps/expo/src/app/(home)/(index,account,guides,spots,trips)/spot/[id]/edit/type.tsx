import { useLocalSearchParams, useRouter } from "expo-router"
import * as React from "react"
import { ScrollView, View } from "react-native"

import type { SpotType } from "@ramble/database/types"
import { SPOT_TYPE_OPTIONS } from "@ramble/shared"

import { SpotIcon } from "~/components/SpotIcon"
import { Button } from "~/components/ui/Button"
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
    <EditSpotModalView title="what type?">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex flex-row flex-wrap gap-2 pt-4">
          {SPOT_TYPE_OPTIONS.filter((s) => (me?.isAdmin ? true : !s.isComingSoon)).map((spotType) => (
            <Button
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
            Next
          </Button>
        </View>
      )}
    </EditSpotModalView>
  )
}
