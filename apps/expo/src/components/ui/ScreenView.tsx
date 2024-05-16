import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import type * as React from "react"
import { TouchableOpacity, View } from "react-native"

import { merge } from "@ramble/shared"

import { SafeAreaView } from "~/components/SafeAreaView"

import { StatusBar } from "expo-status-bar"
import { Icon } from "../Icon"
import { BrandHeading } from "./BrandHeading"

interface Props {
  title?: string | React.ReactNode
  children?: React.ReactNode
  onBack?: () => void
  rightElement?: React.ReactNode
  containerClassName?: string
}

export function ScreenView(props: Props) {
  const router = useRouter()
  return (
    <SafeAreaView>
      <StatusBar style="auto" />
      <View className="flex-1">
        <View className="flex h-14 flex-row items-center justify-between px-4 ">
          <View className="flex-1">
            <TouchableOpacity onPress={props.onBack || router.back} className="sq-8 flex items-center justify-center pt-0.5">
              <Icon icon={ChevronLeft} color="primary" />
            </TouchableOpacity>
          </View>
          <View className="flex flex-2 max-w-[80%]">
            {typeof props.title === "string" ? (
              <BrandHeading className="text-xl text-center" numberOfLines={1} style={{ paddingHorizontal: 3 }}>
                {props.title.toLowerCase()}
              </BrandHeading>
            ) : (
              props.title
            )}
          </View>
          <View className="flex flex-1 flex-row justify-end">{props.rightElement}</View>
        </View>
        <View className={merge("flex-1 px-4", props.containerClassName)}>{props.children}</View>
      </View>
    </SafeAreaView>
  )
}
