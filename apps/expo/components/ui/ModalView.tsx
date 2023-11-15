import type * as React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { StatusBar } from "expo-status-bar"
import { X } from "lucide-react-native"

import { join } from "@ramble/shared"

import { useRouter } from "../../app/router"
import { isAndroid } from "../../lib/device"
import { Icon } from "../Icon"
import { BrandHeading } from "./BrandHeading"
import { Toast } from "./Toast"

interface Props {
  title?: string
  shouldRenderToast?: boolean
  onBack?: () => void
  children?: React.ReactNode
}

export function ModalView(props: Props) {
  const navigation = useRouter()

  return (
    <View className={join("bg-background dark:bg-background-dark h-full flex-grow px-4 pt-6", isAndroid ? "pt-10" : "pt-6")}>
      <View className="flex flex-row justify-between pb-2">
        {props.title ? <BrandHeading className="w-11/12 text-3xl">{props.title}</BrandHeading> : <Text />}
        <TouchableOpacity onPress={props.onBack || navigation.goBack} className="p-1">
          <Icon icon={X} size={24} />
        </TouchableOpacity>
      </View>

      {props.children}
      <StatusBar style="light" />
      {props.shouldRenderToast && <Toast />}
    </View>
  )
}
