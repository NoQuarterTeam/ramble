import type * as React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { StatusBar } from "expo-status-bar"
import { X } from "lucide-react-native"

import { join } from "@ramble/shared"

import { useRouter } from "../../app/router"
import { isAndroid } from "../../lib/device"
import { Heading } from "./Heading"
import { Toast } from "./Toast"

interface Props {
  title?: string
  shouldRenderToast?: boolean
  onBack?: () => void
  children: React.ReactNode
}

export function ModalView(props: Props) {
  const navigation = useRouter()

  return (
    <View className={join("h-full flex-grow bg-white px-4 pt-6 dark:bg-black", isAndroid ? "pt-10" : "pt-6")}>
      <View className="flex flex-row justify-between pb-2">
        {props.title ? <Heading className="w-11/12 text-2xl">{props.title}</Heading> : <Text />}
        <TouchableOpacity onPress={props.onBack || navigation.goBack} className="p-1">
          <X size={24} className="text-black dark:text-white" />
        </TouchableOpacity>
      </View>

      {props.children}
      <StatusBar style="light" />
      {props.shouldRenderToast && <Toast />}
    </View>
  )
}
