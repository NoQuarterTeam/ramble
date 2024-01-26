import type * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"

import { SafeAreaView } from "~/components/SafeAreaView"

import { Icon } from "../Icon"
import { BrandHeading } from "./BrandHeading"

interface Props {
  title: string
  children?: React.ReactNode
  onBack?: () => void
  rightElement?: React.ReactNode
}

export function ScreenView(props: Props) {
  const router = useRouter()
  return (
    <SafeAreaView>
      <View className="flex-1 px-4 pt-2">
        <View className="flex flex-row items-center justify-between pb-2">
          <View className="flex h-[40px] flex-row items-center space-x-0.5">
            <TouchableOpacity onPress={props.onBack || router.back} className="sq-8 flex items-center justify-center pt-0.5">
              <Icon icon={ChevronLeft} color="primary" />
            </TouchableOpacity>
            <BrandHeading className="text-xl">{props.title.toLowerCase()}</BrandHeading>
          </View>
          {props.rightElement}
        </View>
        {props.children}
      </View>
    </SafeAreaView>
  )
}
