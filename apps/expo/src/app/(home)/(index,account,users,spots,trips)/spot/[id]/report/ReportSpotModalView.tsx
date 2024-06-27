import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ChevronLeft } from "lucide-react-native"
import type * as React from "react"
import { TouchableOpacity, View } from "react-native"

import { join } from "@ramble/shared"

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { Icon } from "~/components/Icon"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { Text } from "~/components/ui/Text"
import { Toast } from "~/components/ui/Toast"

interface Props {
  title: string
  children: React.ReactNode
}

export function ReportSpotModalView(props: Props) {
  const router = useRouter()
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background px-4 pt-4 dark:bg-background-dark">
        <View className="flex flex-row justify-between pb-2">
          <View className={join("flex flex-row items-center space-x-0.5")}>
            <TouchableOpacity onPress={router.back} className="mt-1 p-1">
              <Icon icon={ChevronLeft} size={24} color="primary" />
            </TouchableOpacity>
            {props.title ? <BrandHeading className="text-3xl">{props.title}</BrandHeading> : <Text />}
          </View>
        </View>
        {props.children}
        <StatusBar style="light" />
        <Toast />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
