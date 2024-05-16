import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { X } from "lucide-react-native"
import type * as React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

import { merge } from "@ramble/shared"

import { Icon } from "../Icon"
import { BrandHeading } from "./BrandHeading"
import { Toast } from "./Toast"

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
        edges={["top"]}
        {...props}
        className={merge("flex-1 bg-background px-4 pt-4 dark:bg-background-dark", props.containerClassName)}
      >
        <View className="flex flex-row justify-between pb-2">
          {props.title ? (
            <BrandHeading className="w-11/12 text-3xl" numberOfLines={1}>
              {props.title.toLowerCase()}
            </BrandHeading>
          ) : (
            <Text />
          )}
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
