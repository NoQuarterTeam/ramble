import type * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"

import { merge } from "@ramble/shared"

import { SafeAreaView } from "~/components/SafeAreaView"

import { Icon } from "../Icon"
import { BrandHeading } from "./BrandHeading"

interface Props {
  title: string | React.ReactNode
  children?: React.ReactNode
  onBack?: () => void
  rightElement?: React.ReactNode
  containerClassName?: string
}

export function ScreenView(props: Props) {
  const router = useRouter()
  return (
    <SafeAreaView>
      <View className="flex-1">
        <View className="flex flex-row items-center justify-between px-4 py-2">
          <View className="flex h-[40px] flex-row items-center space-x-0.5">
            <TouchableOpacity onPress={props.onBack || router.back} className="sq-8 flex items-center justify-center pt-0.5">
              <Icon icon={ChevronLeft} color="primary" />
            </TouchableOpacity>
            {typeof props.title === "string" ? (
              <BrandHeading className="text-xl">{props.title.toLowerCase()}</BrandHeading>
            ) : (
              props.title
            )}
          </View>
          {props.rightElement}
        </View>
        <View className={merge("flex-1 px-4", props.containerClassName)}>{props.children}</View>
      </View>
    </SafeAreaView>
  )
}
