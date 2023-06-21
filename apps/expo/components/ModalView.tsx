import type * as React from "react"
import { Text, TouchableOpacity, useColorScheme, View } from "react-native"
import Feather from "@expo/vector-icons/Feather"

import { StatusBar } from "expo-status-bar"

import { Heading } from "./Heading"
import { useRouter } from "../app/router"

interface Props {
  title?: string
  onBack?: () => void
  children: React.ReactNode
}

export function ModalView(props: Props) {
  const navigation = useRouter()
  const colorScheme = useColorScheme()
  return (
    <View className="h-full bg-white px-4 pt-6 dark:bg-black">
      <View className="flex flex-row justify-between pb-2">
        {props.title ? <Heading className="w-11/12 text-2xl">{props.title}</Heading> : <Text />}
        <TouchableOpacity onPress={props.onBack || navigation.goBack} className="p-1">
          <Feather name="x" size={24} color={colorScheme === "dark" ? "white" : "black"} />
        </TouchableOpacity>
      </View>
      {props.children}
      <StatusBar style="light" />
    </View>
  )
}
