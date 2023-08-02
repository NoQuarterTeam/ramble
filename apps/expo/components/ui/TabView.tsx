import type * as React from "react"
import { View } from "react-native"

import { join } from "@ramble/shared"

import { Heading } from "./Heading"

interface Props {
  title: string
  children?: React.ReactNode
  rightElement?: React.ReactNode
}

export function TabView(props: Props) {
  return (
    <View className="min-h-full px-4 pt-14">
      <View className="flex flex-row items-center justify-between">
        <View className={join("flex flex-row items-center space-x-0.5")}>
          <Heading className="py-2 text-3xl">{props.title}</Heading>
        </View>
        {props.rightElement}
      </View>
      {props.children}
    </View>
  )
}
