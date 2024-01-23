import type * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { ChevronLeft } from "lucide-react-native"

import { join } from "@ramble/shared"

import { Icon } from "../../../../../components/Icon"
import { BrandHeading } from "../../../../../components/ui/BrandHeading"
import { Toast } from "../../../../../components/ui/Toast"
import { useRouter } from "../../../../router"

interface Props {
  title: string
  children: React.ReactNode
}

export function ReportSpotModalView(props: Props) {
  const router = useRouter()
  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-background dark:bg-background-dark flex-1 px-4 pt-4">
        <View className="flex flex-row justify-between pb-2">
          <View className={join("flex flex-row items-center space-x-0.5")}>
            <TouchableOpacity onPress={router.goBack} className="mt-1 p-1">
              <Icon icon={ChevronLeft} size={24} color="primary" />
            </TouchableOpacity>

            <BrandHeading className="text-2xl">{props.title}</BrandHeading>
          </View>
        </View>

        {props.children}
        <StatusBar style="light" />
        <Toast />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
