import * as React from "react"
import { ScrollView, Switch, View } from "react-native"
import colors from "@ramble/tailwind-config/src/colors"
import { Heading } from "../../components/ui/Heading"

import { useMe } from "../../lib/hooks/useMe"
import { useRouter } from "../router"
import { api } from "../../lib/api"

import { Button } from "../../components/ui/Button"
import { IconProps } from "../../components/ui/Icons"
import { interestOptions } from "../../lib/interests"
import { Text } from "../../components/ui/Text"
import { FormError } from "../../components/ui/FormError"

export default function OnboardingStep2Screen() {
  const { me } = useMe()

  const router = useRouter()

  const utils = api.useContext()
  const { mutate, isLoading, error } = api.user.update.useMutation({
    onSuccess: async () => {
      await utils.user.me.refetch()
      router.push("OnboardingStep3Screen")
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
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-20">
          <Heading className="mb-4 text-2xl">What are you into?</Heading>
          {interestOptions.map((interest) => (
            <InterestSelector
              key={interest.value}
              onToggle={() => onToggle(interest.value as keyof typeof interests)}
              Icon={interest.Icon}
              label={interest.label}
              isSelected={interests[interest.value as keyof typeof interests]}
            />
          ))}
        </View>
        <FormError error={error} />
      </ScrollView>
      <View className="absolute bottom-10 left-0 right-0 flex flex-row items-center justify-between px-4">
        <Button onPress={router.goBack} variant="ghost">
          Back
        </Button>
        <View className="flex flex-row items-center space-x-2">
          <Button onPress={() => router.push("OnboardingStep3Screen")} variant="link">
            Skip
          </Button>
          <Button className="w-[120px]" isLoading={isLoading} onPress={onSubmit}>
            Next
          </Button>
        </View>
      </View>
    </View>
  )
}

function InterestSelector({
  label,
  isSelected,
  onToggle,
  Icon,
}: {
  isSelected: boolean
  onToggle: () => void
  label: string
  Icon: (props: IconProps) => JSX.Element
}) {
  return (
    <View className="mb-2 flex w-full flex-row items-center justify-between p-4">
      <View className="flex flex-row items-center space-x-2">
        <Icon className="sq-4 text-black dark:text-white" />
        <Text className="text-xl">{label}</Text>
      </View>
      <Switch trackColor={{ true: colors.primary[600] }} value={isSelected} onValueChange={onToggle} />
    </View>
  )
}
