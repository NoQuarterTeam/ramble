import { join } from "@ramble/shared"
import dayjs from "dayjs"
import { useRouter } from "expo-router"
import * as React from "react"
import { Platform, ScrollView, TouchableOpacity, View } from "react-native"

import Purchases, { type PurchasesPackage } from "react-native-purchases"
import { Paywall } from "~/components/Paywall"
import { Button } from "~/components/ui/Button"
import { Heading } from "~/components/ui/Heading"
import { ModalView } from "~/components/ui/ModalView"

import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"

import { isAndroid } from "~/lib/device"
import { revenueCatKey } from "~/lib/revenue-cat"

const periodConversion = {
  P1W: "week",
  P1M: "month",
  P1Y: "year",
}
const titleConversion = {
  P1W: "Weekly",
  P1M: "Monthly",
  P1Y: "Yearly",
}

export default function Screen() {
  const { data: me } = api.user.me.useQuery(undefined, { staleTime: 0, cacheTime: 0 })

  const [selectedPackage, setSelectedPackage] = React.useState<PurchasesPackage>()
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!me) return
    const init = async () => {
      if (Platform.OS === "ios") {
        await Purchases.configure({ apiKey: revenueCatKey.ios, appUserID: me.id })
      } else if (Platform.OS === "android") {
        await Purchases.configure({ apiKey: revenueCatKey.android, appUserID: me.id })
      }
      await getOfferings()
    }
    init()
  }, [me])

  const [offerings, setOfferings] = React.useState<PurchasesPackage[]>()

  const getOfferings = async () => {
    try {
      const off = await Purchases.getOfferings()
      setOfferings(off.all.default?.availablePackages)
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  const utils = api.useUtils()
  const { mutate } = api.user.updateMembership.useMutation({
    onMutate: async (input) => {
      utils.user.me.setData(undefined, (prev) => (prev ? { ...prev, ...input } : prev))
    },
  })
  const router = useRouter()
  const [isPurchasing, setIsPurchasing] = React.useState(false)
  const handlePurchase = async () => {
    try {
      if (!selectedPackage || !me) return
      setIsPurchasing(true)
      const result = await Purchases.purchasePackage(selectedPackage)
      if (!me.planId) {
        mutate({
          planId: result.productIdentifier,
          planExpiry: result.customerInfo.latestExpirationDate
            ? new Date(result.customerInfo.latestExpirationDate)
            : dayjs().add(1, "month").toDate(),
        })
      }
      router.back()
    } catch (error) {
      console.log(error)
    } finally {
      setIsPurchasing(false)
    }
  }

  if (!me)
    return (
      <ModalView title="membership">
        <Paywall action="get unlimited access" />
      </ModalView>
    )

  return (
    <ModalView>
      {isLoading ? (
        <Spinner />
      ) : !offerings ? (
        <Text>There was an issue finding the memberships, please come back later!</Text>
      ) : (
        <View className="flex-1 relative">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <View className="space-y-6">
              <View>
                <Heading className="text-3xl">{me.planId ? "Explorer" : "Become an Explorer"}</Heading>
                <Text className="text-base">
                  Unlimited access to all features on Ramble, create trips, save spots to lists, follow other Ramble users and
                  much more. {me.planId ? "" : "Ready to start?"}
                </Text>
              </View>
              <View className="space-y-3">
                {!me.planId && (
                  <View className="bg-gray-200 dark:bg-gray-700 rounded-sm p-4">
                    {dayjs(me.trialExpiresAt).isAfter(dayjs()) ? (
                      <Text>Your trial expires on {dayjs(me.trialExpiresAt).format("DD/MM/YYYY")}</Text>
                    ) : (
                      <Text>Trial expired</Text>
                    )}
                  </View>
                )}
                {offerings.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.identifier}
                    onPress={() => setSelectedPackage(selectedPackage?.identifier === pkg.identifier ? undefined : pkg)}
                    activeOpacity={0.8}
                    disabled={me.planId === pkg.product.identifier}
                    className={join(
                      "flex flex-row p-6 border border-gray-200 dark:border-gray-700 rounded-sm justify-between items-center",
                      selectedPackage?.identifier === pkg.identifier && "border-primary",
                      me.planId === pkg.product.identifier && "bg-primary",
                    )}
                  >
                    <View>
                      <Text className={join("text-2xl", me.planId === pkg.product.identifier && "text-white")}>
                        {pkg.product.subscriptionPeriod
                          ? titleConversion[pkg.product.subscriptionPeriod as keyof typeof titleConversion]
                          : pkg.product.title}
                      </Text>
                      {me.planId === pkg.product.identifier && (
                        <View className="bg-background dark:bg-background-dark rounded-full px-2 py-0.5">
                          <Text className="text-xs">
                            {`${!me.planCancelledAt ? "Until" : "Cancels"} ${dayjs(me.planCancelledAt || me.planExpiry!).format(
                              "DD/MM/YYYY",
                            )}`}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex items-end">
                      <Text className={join("text-xl", me.planId === pkg.product.identifier && "text-white")}>
                        {pkg.product.priceString}
                        <Text className={join("text-sm", me.planId === pkg.product.identifier && "text-white")}>
                          {pkg.product.subscriptionPeriod
                            ? ` / ${periodConversion[pkg.product.subscriptionPeriod as keyof typeof periodConversion]}`
                            : ""}
                        </Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <Text className="text-center">
                Recurring billing. Cancel anytime. You can manage and cancel your subcription by going to your{" "}
                {isAndroid ? "Play Store" : "App Store"} account settings after purchase. If you've used the trial before you will
                be charged immediately.
              </Text>
              {/* <Button
                variant="link"
                onPress={async () => {
                  const res = await Purchases.restorePurchases()
                  console.log(res)
                }}
              >
                Restore purchases
              </Button> */}
            </View>
          </ScrollView>

          {!me.planId && (
            <View className="absolute bottom-16 left-0 right-0 flex items-center justify-center">
              <Button isLoading={isPurchasing} className="w-full" disabled={!selectedPackage} onPress={handlePurchase}>
                Continue
              </Button>
            </View>
          )}
        </View>
      )}
    </ModalView>
  )
}
