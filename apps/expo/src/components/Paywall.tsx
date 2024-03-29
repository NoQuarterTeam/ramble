import dayjs from "dayjs"
import { useRouter } from "expo-router"
import type * as React from "react"
import { ScrollView, View } from "react-native"

import type { RouterOutputs } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { Button } from "./ui/Button"
import { Text } from "./ui/Text"

export function requiresPaywall(user?: RouterOutputs["user"]["me"] | null | undefined): boolean {
  if (!user) return true
  if (user.isAdmin) return false
  if (user.planId && user.planExpiry) return dayjs(user.planExpiry).isBefore(dayjs())
  return dayjs(user.trialExpiresAt).isBefore(dayjs())
}

interface Props {
  action: string
  children?: React.ReactNode
}

export function Paywall(props: Props) {
  const router = useRouter()
  const { me } = useMe()
  const isTrialExpired = me?.trialExpiresAt && new Date(me.trialExpiresAt) < new Date()
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="space-y-4">
        <View className="space-y-4">
          {isTrialExpired ? (
            <Text className="text-lg">Your trial has expired</Text>
          ) : (
            <Text className="text-lg leading-5">Join now to {props.action.toLowerCase()}, no payment required.</Text>
          )}
          <View>
            {me ? (
              <Button onPress={() => router.push("/membership")}>Subscribe</Button>
            ) : (
              <Button onPress={() => router.push("/register")}>Start with 1 month free</Button>
            )}
          </View>
        </View>
        <View>{props.children}</View>
      </View>
    </ScrollView>
  )
}
