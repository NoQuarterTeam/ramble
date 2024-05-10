import * as React from "react"
import { ScrollView, Switch, View } from "react-native"

import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"

import type { IconProps } from "~/components/ui/Icons"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { interestOptions } from "~/lib/models/user"

export default function InterestsScreen() {
  const { me } = useMe()
  const [interests, setInterests] = React.useState({
    isSurfer: !!me?.isSurfer,
    isClimber: !!me?.isClimber,
    isMountainBiker: !!me?.isMountainBiker,
    isPaddleBoarder: !!me?.isPaddleBoarder,
    isHiker: !!me?.isHiker,
    isPetOwner: !!me?.isPetOwner,
    isYogi: !!me?.isYogi,
  })
  const utils = api.useUtils()
  const { mutate } = api.user.update.useMutation({
    onSuccess: (data) => {
      utils.user.me.setData(undefined, data)
      toast({ title: "Interests updated." })
    },
  })

  const onToggle = (field: keyof typeof interests) => {
    setInterests({ ...interests, [field]: !interests[field] })
    mutate({ [field]: !interests[field] })
  }

  return (
    <ScreenView title="Interests">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {interestOptions.map((interest) => (
          <InterestSelector
            key={interest.value}
            onToggle={() => onToggle(interest.value as keyof typeof interests)}
            icon={interest.Icon}
            label={interest.label}
            isSelected={interests[interest.value as keyof typeof interests]}
          />
        ))}
      </ScrollView>
    </ScreenView>
  )
}

function InterestSelector({
  label,
  isSelected,
  onToggle,
  icon,
}: {
  isSelected: boolean
  onToggle: () => void
  label: string
  icon: (props: IconProps) => JSX.Element
}) {
  return (
    <View className="flex w-full flex-row items-center justify-between px-4 py-2">
      <View className="flex flex-row items-center space-x-2">
        <Icon icon={icon} size={20} />
        <Text className="text-lg">{label}</Text>
      </View>
      <Switch trackColor={{ true: colors.primary[600] }} value={isSelected} onValueChange={onToggle} />
    </View>
  )
}
