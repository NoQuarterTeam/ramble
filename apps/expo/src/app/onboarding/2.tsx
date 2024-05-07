import { useRouter } from "expo-router"
import * as React from "react"
import { ScrollView, Switch, View } from "react-native"

import type { SpotType } from "@ramble/database/types"
import colors from "@ramble/tailwind-config/src/colors"

import { Icon } from "~/components/Icon"
import { SafeAreaView } from "~/components/SafeAreaView"
import { Button } from "~/components/ui/Button"
import { FormError } from "~/components/ui/FormError"
import { Heading } from "~/components/ui/Heading"
import type { IconProps } from "~/components/ui/Icons"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { interestOptions } from "~/lib/models/user"

import { useMapFilters } from "../filters"

export default function OnboardingStep2Screen() {
  const { me } = useMe()

  const router = useRouter()
  const setFilters = useMapFilters((state) => state.setFilters)
  const utils = api.useUtils()
  const { mutate, isPending: isLoading } = api.user.update.useMutation({
    onSuccess: async (data) => {
      await utils.user.me.refetch()
      setFilters({
        types: [
          "CAMPING",
          "FREE_CAMPING",
          "REWILDING",
          data?.isMountainBiker ? "MOUNTAIN_BIKING" : null,
          data?.isClimber ? "CLIMBING" : null,
          data?.isHiker ? "HIKING_TRAIL" : null,
          data?.isSurfer ? "SURFING" : null,
          data?.isPaddleBoarder ? "PADDLE_KAYAK" : null,
          data?.isYogi ? "YOGA" : null,
        ].filter(Boolean) as SpotType[],
      })
      router.push("/onboarding/3")
    },
  })

  const [interests, setInterests] = React.useState({
    isSurfer: !!me?.isSurfer,
    isClimber: !!me?.isClimber,
    isMountainBiker: !!me?.isMountainBiker,
    isPaddleBoarder: !!me?.isPaddleBoarder,
    isHiker: !!me?.isHiker,
    isPetOwner: !!me?.isPetOwner,
  })

  const onToggle = (field: keyof typeof interests) => setInterests({ ...interests, [field]: !interests[field] })

  const onSubmit = () => mutate(interests)

  return (
    <SafeAreaView>
      <View className="flex-1 px-4">
        <ScrollView className="space-y-4" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <Heading className="text-2xl">What are you into?</Heading>

          <View>
            {interestOptions.map((interest) => (
              <InterestSelector
                key={interest.value}
                onToggle={() => onToggle(interest.value as keyof typeof interests)}
                icon={interest.Icon}
                label={interest.label}
                isSelected={interests[interest.value as keyof typeof interests]}
              />
            ))}
          </View>

          <View className="flex flex-row items-center justify-between">
            <Button onPress={router.back} variant="ghost">
              Back
            </Button>
            <View className="flex flex-row items-center space-x-2">
              <Button onPress={() => router.push("/onboarding/3")} variant="link">
                Skip
              </Button>
              <Button className="w-[120px]" isLoading={isLoading} onPress={onSubmit}>
                Next
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
    <View className="flex w-full flex-row items-center justify-between p-4">
      <View className="flex flex-row items-center space-x-2">
        <Icon icon={icon} className="sq-4" />
        <Text className="text-xl">{label}</Text>
      </View>
      <Switch trackColor={{ true: colors.primary[600] }} value={isSelected} onValueChange={onToggle} />
    </View>
  )
}
