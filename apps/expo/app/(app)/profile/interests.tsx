import * as React from "react"
import { ScrollView, Switch, View } from "react-native"
import { Bike, Dog, Footprints, Mountain, Waves } from "lucide-react-native"

import colors from "@ramble/tailwind-config/src/colors"

import { FormError } from "../../../components/ui/FormError"
import { type IconProps, Icons } from "../../../components/ui/Icons"
import { ScreenView } from "../../../components/ui/ScreenView"
import { Text } from "../../../components/ui/Text"
import { toast } from "../../../components/ui/Toast"
import { api } from "../../../lib/api"
import { useMe } from "../../../lib/hooks/useMe"

export function InterestsScreen() {
  const { me } = useMe()
  const [interests, setInterests] = React.useState({
    isSurfer: !!me?.isSurfer,
    isClimber: !!me?.isClimber,
    isMountainBiker: !!me?.isMountainBiker,
    isPaddleBoarder: !!me?.isPaddleBoarder,
    isHiker: !!me?.isHiker,
    isPetOwner: !!me?.isPetOwner,
  })
  const utils = api.useContext()
  const { mutate, error } = api.user.update.useMutation({
    onSuccess: (data) => {
      utils.user.me.setData(undefined, data)
      toast({ title: "Interests updated." })
    },
  })

  const onToggle = (field: keyof typeof interests) => {
    setInterests({ ...interests, [field]: !interests[field] })
    mutate({ [field]: interests[field] })
  }

  return (
    <ScreenView title="Interests">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <InterestSelector
          onToggle={() => onToggle("isSurfer")}
          Icon={Icons.Surf}
          label="Surfing"
          isSelected={interests.isSurfer}
        />
        <InterestSelector
          onToggle={() => onToggle("isClimber")}
          Icon={Mountain}
          label="Climbing"
          isSelected={interests.isClimber}
        />
        <InterestSelector
          onToggle={() => onToggle("isMountainBiker")}
          Icon={Bike}
          label="Mountain biking"
          isSelected={interests.isMountainBiker}
        />
        <InterestSelector
          onToggle={() => onToggle("isPaddleBoarder")}
          Icon={Waves}
          label="Paddle Boarding"
          isSelected={interests.isPaddleBoarder}
        />
        <InterestSelector onToggle={() => onToggle("isHiker")} Icon={Footprints} label="Hiking" isSelected={interests.isHiker} />
        <InterestSelector
          onToggle={() => onToggle("isPetOwner")}
          Icon={Dog}
          label="Pet owner"
          isSelected={interests.isPetOwner}
        />
        <FormError error={error} />
      </ScrollView>
    </ScreenView>
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
