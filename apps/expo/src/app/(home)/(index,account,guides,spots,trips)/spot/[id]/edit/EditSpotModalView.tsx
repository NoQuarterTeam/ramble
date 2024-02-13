import type * as React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ChevronLeft, X } from "lucide-react-native"

import { join } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { Toast } from "~/components/ui/Toast"

interface Props {
  title?: string
  shouldRenderToast?: boolean
  canGoBack?: boolean
  children: React.ReactNode
}

export function EditSpotModalView({ canGoBack = true, ...props }: Props) {
  const router = useRouter()

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top", "bottom"]} className="bg-background dark:bg-background-dark flex-1 px-4 pt-4">
        <View className="flex flex-row justify-between pb-2">
          <View className={join("flex flex-row items-center space-x-0.5")}>
            {canGoBack && (
              <TouchableOpacity onPress={router.back} className="mt-1 p-1">
                <Icon icon={ChevronLeft} size={24} color="primary" />
              </TouchableOpacity>
            )}

            {props.title ? <BrandHeading className="text-3xl">{props.title}</BrandHeading> : <Text />}
          </View>
          <TouchableOpacity onPress={() => router.back()} className="p-1">
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
