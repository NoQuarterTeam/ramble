import * as React from "react"
import { ScrollView, Switch, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Dog } from "lucide-react-native"

import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { FormInputLabel } from "~/components/ui/FormInput"
import { Input } from "~/components/ui/Input"
import { Text } from "~/components/ui/Text"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { ReportSpotModalView } from "./ReportSpotModalView"

export default function SpotReportInfoScreen() {
  const router = useRouter()
  const { id, ...params } = useLocalSearchParams<{ id: string; name: string; description: string; isPetFriendly: string }>()
  const [name, setName] = React.useState(params.name)
  const [description, setDescription] = React.useState(params.description)
  const [isPetFriendly, setIsPetFriendly] = React.useState(params.isPetFriendly === "true")
  const tab = useTabSegment()
  const onClose = () => {
    router.navigate(
      `/${tab}/spot/${id}/report?${new URLSearchParams({ ...params, name, description, isPetFriendly: String(isPetFriendly) })}`,
    )
  }
  return (
    <ReportSpotModalView title="basic info">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
        className="space-y-2"
      >
        <View>
          <FormInputLabel label="Name" />
          <Input value={name} onChangeText={setName} />
        </View>
        <View className="flex w-full flex-row items-center justify-between py-4">
          <View className="flex flex-row items-center space-x-2">
            <Icon icon={Dog} size={20} />
            <Text className="text-xl">Pet friendly</Text>
          </View>
          <Switch
            trackColor={{ true: colors.primary[600] }}
            value={isPetFriendly}
            onValueChange={() => setIsPetFriendly((p) => !p)}
          />
        </View>
        <View>
          <FormInputLabel label="Describe the spot" />
          <Input value={description || ""} onChangeText={setDescription} multiline numberOfLines={4} />
        </View>
        <Button onPress={onClose}>Done</Button>
      </ScrollView>
    </ReportSpotModalView>
  )
}
