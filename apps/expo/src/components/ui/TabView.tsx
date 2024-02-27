import { StatusBar } from "expo-status-bar"
import type * as React from "react"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { join } from "@ramble/shared"

import { BrandHeading } from "./BrandHeading"

interface Props {
  title: string | React.ReactNode
  children?: React.ReactNode
  rightElement?: React.ReactNode
}

export function TabView(props: Props) {
  const insets = useSafeAreaInsets()
  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 px-4">
      <StatusBar style="auto" />
      <View className="flex flex-row items-center justify-between pb-2">
        <View className={join("flex flex-row items-center space-x-0.5")}>
          {typeof props.title === "string" ? <BrandHeading className="py-2 text-4xl">{props.title}</BrandHeading> : props.title}
        </View>
        {props.rightElement}
      </View>
      {props.children}
    </View>
  )
}
