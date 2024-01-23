import type * as React from "react"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { join } from "@ramble/shared"

import { BrandHeading } from "./BrandHeading"

interface Props {
  title: string | React.ReactNode
  children?: React.ReactNode
  rightElement?: React.ReactNode
}

export function TabView(props: Props) {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 px-4">
      <View className="flex flex-row items-center justify-between">
        <View className={join("flex flex-row items-center space-x-0.5")}>
          {typeof props.title === "string" ? <BrandHeading className="py-2 text-4xl">{props.title}</BrandHeading> : props.title}
        </View>
        {props.rightElement}
      </View>
      {props.children}
    </SafeAreaView>
  )
}
