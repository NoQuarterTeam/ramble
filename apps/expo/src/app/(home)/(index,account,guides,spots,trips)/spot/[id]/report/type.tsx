import { useLocalSearchParams, useRouter } from "expo-router"
import * as React from "react"
import { ScrollView, View } from "react-native"

import type { SpotType } from "@ramble/database/types"
import { SPOT_TYPE_OPTIONS } from "@ramble/shared"

import { SpotIcon } from "~/components/SpotIcon"
import { Button } from "~/components/ui/Button"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { ReportSpotModalView } from "./ReportSpotModalView"

export default function SpotReportTypeScreen() {
  const router = useRouter()
  const { id, ...params } = useLocalSearchParams<{ id: string; type: SpotType }>()
  const [type, setType] = React.useState(params.type)

  const tab = useTabSegment()
  const onClose = () => {
    router.navigate(`/${tab}/spot/${id}/report?${new URLSearchParams({ ...params, type })}`)
  }
  return (
    <ReportSpotModalView title="Type">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        className="space-y-2"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-row flex-wrap gap-2 pt-4">
          {SPOT_TYPE_OPTIONS.filter((s) => !s.isComingSoon).map((spotType) => (
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
        <Button onPress={onClose}>Done</Button>
      </ScrollView>
    </ReportSpotModalView>
  )
}
