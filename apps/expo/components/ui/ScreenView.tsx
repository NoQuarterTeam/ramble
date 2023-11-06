import type * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { ChevronLeft } from "lucide-react-native"

import { useRouter } from "../../app/router"
import { Icon } from "../Icon"
import { BrandHeading } from "./BrandHeading"

interface Props {
  title: string
  children?: React.ReactNode
  onBack?: () => void
  rightElement?: React.ReactNode
}

export function ScreenView(props: Props) {
  const { goBack } = useRouter()
  return (
    <View className="min-h-full px-4 pt-16">
      <View className="flex flex-row items-center justify-between pb-2">
        <View className="flex h-[40px] flex-row items-center space-x-0.5">
          <TouchableOpacity onPress={props.onBack || goBack} className="sq-8 flex items-center justify-center pt-0.5">
            <Icon icon={ChevronLeft} color="primary" />
          </TouchableOpacity>
          <BrandHeading className="text-xl">{props.title.toLowerCase()}</BrandHeading>
        </View>
        {props.rightElement}
      </View>
      {props.children}
    </View>
  )
}
