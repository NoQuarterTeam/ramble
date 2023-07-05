import type * as React from "react"
import { TouchableOpacity, useColorScheme, View } from "react-native"
import Feather from "@expo/vector-icons/Feather"

import { join } from "@ramble/shared"

import { useRouter } from "../../app/router"
import { Heading } from "./Heading"

interface Props {
  title: string
  children: React.ReactNode
  rightElement?: React.ReactNode
}

export function ScreenView(props: Props) {
  const colorScheme = useColorScheme()
  const { goBack } = useRouter()
  return (
    <View className="min-h-full px-4 pt-16">
      <View className="flex flex-row  items-center justify-between">
        <View className={join("flex flex-row items-center space-x-0.5", !!props.rightElement && "w-4/5")}>
          <TouchableOpacity onPress={goBack} className="mb-1 p-1">
            <Feather name="chevron-left" size={24} color={colorScheme === "dark" ? "white" : "black"} />
          </TouchableOpacity>

          <Heading className="py-2 text-3xl">{props.title}</Heading>
        </View>
        {props.rightElement}
      </View>
      {props.children}
    </View>
  )
}
