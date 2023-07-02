import type * as React from "react"
import { TouchableOpacity, useColorScheme, View } from "react-native"
import Feather from "@expo/vector-icons/Feather"

import { useRouter } from "../../app/router"
import { Heading } from "./Heading"
import { join } from "@ramble/shared"
import { isAndroid } from "../../lib/device"

interface Props {
  title: string
  children: React.ReactNode
  rightElement?: React.ReactNode
}

export function ScreenView(props: Props) {
  const colorScheme = useColorScheme()
  const { goBack } = useRouter()
  return (
    <View className={join("min-h-full px-4", isAndroid ? "pt-24" : "pt-20")}>
      <View className="flex flex-row items-center justify-between">
        <View className="flex flex-row items-center space-x-0.5">
          <TouchableOpacity onPress={goBack} className="mb-1 p-2">
            <Feather name="chevron-left" size={24} color={colorScheme === "dark" ? "white" : "black"} />
          </TouchableOpacity>

          <Heading className="text-3xl dark:text-white">{props.title}</Heading>
        </View>
        {props.rightElement}
      </View>
      {props.children}
    </View>
  )
}
