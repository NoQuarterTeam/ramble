import type * as React from "react"
import { Text, TouchableOpacity, useColorScheme, View } from "react-native"
import Feather from "@expo/vector-icons/Feather"
import { StatusBar } from "expo-status-bar"

import { join } from "@ramble/shared"
import { Heading } from "../../../../../components/ui/Heading"
import { Toast } from "../../../../../components/ui/Toast"
import { isAndroid } from "../../../../../lib/device"
import { useRouter } from "../../../../router"

interface Props {
  title?: string
  shouldRenderToast?: boolean
  canGoBack?: boolean
  children: React.ReactNode
}

export function NewModalView({ canGoBack = true, ...props }: Props) {
  const navigation = useRouter()

  const colorScheme = useColorScheme()
  return (
    <View className={join("h-full flex-grow bg-white px-4 pt-6 dark:bg-black", isAndroid ? "pt-10" : "pt-6")}>
      <View className="flex flex-row justify-between pb-2">
        <View className={join("flex flex-row items-center space-x-0.5")}>
          {canGoBack && (
            <TouchableOpacity onPress={navigation.goBack} className="mb-1 p-1">
              <Feather name="chevron-left" size={24} color={colorScheme === "dark" ? "white" : "black"} />
            </TouchableOpacity>
          )}

          {props.title ? <Heading className="text-2xl">{props.title}</Heading> : <Text />}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("AppLayout")} className="p-1">
          <Feather name="x" size={24} color={colorScheme === "dark" ? "white" : "black"} />
        </TouchableOpacity>
      </View>

      {props.children}
      <StatusBar style="light" />
      {props.shouldRenderToast && <Toast />}
    </View>
  )
}
