import type * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { ChevronLeft } from "lucide-react-native"

import { join } from "@ramble/shared"

import { useRouter } from "../../app/router"
import { Text } from "./Text"

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
        <View className={join("flex flex-row items-center space-x-0.5")}>
          <TouchableOpacity onPress={props.onBack || goBack} className="sq-8 flex items-center justify-center">
            <ChevronLeft className="text-black dark:text-white" />
          </TouchableOpacity>
          <Text className="text-lg">{props.title}</Text>
        </View>
        {props.rightElement}
      </View>
      {props.children}
    </View>
  )
}
