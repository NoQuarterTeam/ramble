import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ChevronLeft } from "lucide-react-native"
import type * as React from "react"
import { TouchableOpacity, View } from "react-native"

import { join } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { Toast } from "~/components/ui/Toast"

interface Props {
  title: string
  children: React.ReactNode
}

export function ReportSpotModalView(props: Props) {
  const router = useRouter()
  return (
    <View className="bg-background dark:bg-background-dark flex-1 px-4 pt-4">
      <View className="flex flex-row justify-between pb-2">
        <View className={join("flex flex-row items-center space-x-0.5")}>
          <TouchableOpacity onPress={router.back} className="mt-1 p-1">
            <Icon icon={ChevronLeft} size={24} color="primary" />
          </TouchableOpacity>

          <BrandHeading className="text-2xl">{props.title}</BrandHeading>
        </View>
      </View>

      {props.children}
      <StatusBar style="light" />
      <Toast />
    </View>
  )
}
