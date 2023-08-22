import type * as React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { StatusBar } from "expo-status-bar"
import { ChevronLeft, X } from "lucide-react-native"

import { join } from "@ramble/shared"

import { Heading } from "../../../../../../components/ui/Heading"
import { Toast } from "../../../../../../components/ui/Toast"
import { isAndroid } from "../../../../../../lib/device"
import { useRouter } from "../../../../../router"

interface Props {
  title?: string
  shouldRenderToast?: boolean
  canGoBack?: boolean
  children: React.ReactNode
}

export function EditSpotModalView({ canGoBack = true, ...props }: Props) {
  const navigation = useRouter()

  return (
    <View className={join("h-full flex-grow bg-white px-4 dark:bg-black", isAndroid ? "pt-10" : "pt-6")}>
      <View className="flex flex-row justify-between pb-2">
        <View className={join("flex flex-row items-center space-x-0.5")}>
          {canGoBack && (
            <TouchableOpacity onPress={navigation.goBack} className="mb-1 p-1">
              <ChevronLeft size={24} className="text-black dark:text-white" />
            </TouchableOpacity>
          )}

          {props.title ? <Heading className="text-2xl">{props.title}</Heading> : <Text />}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("AppLayout")} className="p-1">
          <X size={24} className="text-black dark:text-white" />
        </TouchableOpacity>
      </View>

      {props.children}
      <StatusBar style="light" />
      {props.shouldRenderToast && <Toast />}
    </View>
  )
}
