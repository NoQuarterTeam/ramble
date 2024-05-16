import { StatusBar } from "expo-status-bar"
import type * as React from "react"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { merge } from "@ramble/shared"
import { BrandHeading } from "./BrandHeading"

interface Props {
  title: string | React.ReactNode
  children?: React.ReactNode
  rightElement?: React.ReactNode
  containerClassName?: string
}

export function TabView(props: Props) {
  const insets = useSafeAreaInsets()
  return (
    <View style={{ paddingTop: insets.top }} className="flex-1">
      <StatusBar style="auto" />
      <View className="flex h-16 flex-row items-center justify-between px-4">
        <View>
          {typeof props.title === "string" ? <BrandHeading className="text-4xl">{props.title}</BrandHeading> : props.title}
        </View>
        {props.rightElement}
      </View>
      <View className={merge("flex-1 px-4", props.containerClassName)}>{props.children}</View>
    </View>
  )
}
