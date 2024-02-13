import type * as React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { X } from "lucide-react-native"

import { Icon } from "../Icon"
import { BrandHeading } from "./BrandHeading"
import { Toast } from "./Toast"
import { merge } from "@ramble/shared"

interface Props {
  title?: string
  shouldRenderToast?: boolean
  containerClassName?: string
  onBack?: () => void
  children?: React.ReactNode
  edges?: ("top" | "bottom")[]
}

export function ModalView(props: Props) {
  const router = useRouter()
  return (
    <SafeAreaProvider>
      <SafeAreaView
        edges={["top", "bottom"]}
        {...props}
        className={merge("bg-background dark:bg-background-dark flex-1 px-4 pt-4", props.containerClassName)}
      >
        <View className="flex flex-row justify-between pb-2">
          {props.title ? <BrandHeading className="w-11/12 text-3xl">{props.title.toLowerCase()}</BrandHeading> : <Text />}
          <TouchableOpacity onPress={props.onBack || router.back} className="p-1">
            <Icon icon={X} size={24} />
          </TouchableOpacity>
        </View>

        {props.children}
        <StatusBar style="light" />
        {props.shouldRenderToast && <Toast />}
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
