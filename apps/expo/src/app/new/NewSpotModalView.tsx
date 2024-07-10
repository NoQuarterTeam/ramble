import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ChevronLeft, X } from "lucide-react-native"
import type * as React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

import { Icon } from "~/components/Icon"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { Toast } from "~/components/ui/Toast"

interface Props {
  title?: string
  shouldRenderToast?: boolean
  canGoBack?: boolean
  children: React.ReactNode
}

export function NewSpotModalView({ canGoBack = true, ...props }: Props) {
  const router = useRouter()

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-background px-4 pt-4 dark:bg-background-dark">
        <View className="flex flex-row justify-between pb-2">
          <View className="flex flex-row items-center space-x-0.5">
            {canGoBack && (
              <TouchableOpacity onPress={router.back} className="mt-1 p-1">
                <Icon icon={ChevronLeft} size={24} color="primary" />
              </TouchableOpacity>
            )}

            {props.title ? <BrandHeading className="text-2xl">{props.title}</BrandHeading> : <Text />}
          </View>
          <TouchableOpacity
            onPress={() => {
              if (router.canDismiss()) router.dismissAll()
              if (router.canGoBack()) router.back()
            }}
            className="p-1"
          >
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
