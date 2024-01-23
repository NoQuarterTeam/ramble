import * as React from "react"
import { ScrollView, View } from "react-native"

import { SPOT_TYPE_OPTIONS } from "@ramble/shared"

import { SpotIcon } from "../../../../../components/SpotIcon"
import { Button } from "../../../../../components/ui/Button"
import { useParams, useRouter } from "../../../../router"
import { ReportSpotModalView } from "./ReportSpotModalView"

export function SpotReportTypeScreen() {
  const router = useRouter()
  const { params } = useParams<"SpotReportTypeScreen">()
  const [type, setType] = React.useState(params.type)

  const onClose = () => {
    router.navigate("SpotReportScreen", { ...params, type })
  }
  return (
    <ReportSpotModalView title="Type">
      <ScrollView
        keyboardShouldPersistTaps="handled"
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
