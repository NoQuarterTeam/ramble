import { join } from "@ramble/shared"
import dayjs from "dayjs"
import { useRouter } from "expo-router"
import * as React from "react"
import { Platform, ScrollView, TouchableOpacity, View } from "react-native"

import Purchases, { type PurchasesPackage } from "react-native-purchases"
import { Button } from "~/components/ui/Button"
import { Heading } from "~/components/ui/Heading"
import { ModalView } from "~/components/ui/ModalView"

import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"

import { isAndroid } from "~/lib/device"
import { useCustomer } from "~/lib/hooks/useCustomer"
import { useMe } from "~/lib/hooks/useMe"
import { revenueCatKey } from "~/lib/revenue-cat"

const trialConversion = {
  WEEK: "week",
  MONTH: "month",
  ANNUAL: "year",
}
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
  const { me } = useMe()
  const { isLoading: isCustomerLoading, customer } = useCustomer()
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
      if (me?.isAdmin) {
        setOfferings(off.all?.beta?.availablePackages)
      } else {
        setOfferings(off.all.default?.availablePackages)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  const router = useRouter()
  const handlePurchase = async () => {
    try {
      if (!selectedPackage) return
      const result = await Purchases.purchasePackage(selectedPackage)
      console.log({ result })
      router.back()
      // todo: save stuff?
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <ModalView>
      {isCustomerLoading || isLoading ? (
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
                <Heading className="text-3xl">{customer?.isSubscribed ? "Membership" : "Become an Explorer"}</Heading>
                <Text className="text-base">
                  Unlimited access to all features on Ramble, create trips, save spots to lists, follow other Ramble users and
                  much more. Ready to start?
                </Text>
              </View>
              <View className="space-y-2">
                {offerings.map((pkg) => (
                  <TouchableOpacity
                    onPress={() => setSelectedPackage(pkg)}
                    key={pkg.identifier}
                    activeOpacity={0.8}
                    disabled={customer?.activeSubscriptions.includes(pkg.product.identifier)}
                    className={join(
                      "flex flex-row p-6 border border-gray-200 dark:border-gray-700 rounded-sm justify-between items-center",
                      selectedPackage?.identifier === pkg.identifier && "border-primary",
                    )}
                  >
                    <View>
                      <Text className="text-2xl">
                        {pkg.product.subscriptionPeriod
                          ? titleConversion[pkg.product.subscriptionPeriod as keyof typeof titleConversion]
                          : pkg.product.title}
                      </Text>

                      {customer?.activeSubscriptions.includes(pkg.product.identifier) && (
                        <View className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">
                          <Text className="text-xs">
                            {`${customer.entitlements.active["Ramble membership"]?.willRenew ? "Renews" : "Cancels"} ${dayjs(
                              customer.entitlements.active["Ramble membership"]?.expirationDate,
                            ).format("DD/MM/YYYY")}`}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex items-end">
                      <Text className="text-xl">
                        {pkg.product.priceString}
                        <Text className="text-sm">
                          {pkg.product.subscriptionPeriod
                            ? ` / ${periodConversion[pkg.product.subscriptionPeriod as keyof typeof periodConversion]}`
                            : ""}
                        </Text>
                      </Text>
                      {pkg.product.introPrice && (
                        <View className="bg-primary rounded-full px-2 py-0.5">
                          <Text className="text-xs text-white">
                            {pkg.product.introPrice.periodNumberOfUnits}{" "}
                            {trialConversion[pkg.product.introPrice.periodUnit as keyof typeof trialConversion]} free
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <Text className="text-center">
                Recurring billing. Cancel anytime. You can manage and cancel your subcription by going to your{" "}
                {isAndroid ? "Play Store" : "App Store"} account settings after purchase. If you've used the trial before you will
                be charged immediately.
              </Text>

              <View className="pt-20" />
              <Text>{JSON.stringify(customer, null, 2)}</Text>
              <View className="pt-20" />
              <Text>{JSON.stringify(offerings, null, 2)}</Text>
            </View>
          </ScrollView>

          <View className="absolute bottom-12 left-0 right-0 flex items-center justify-center">
            <Button className="bg-primary w-full" disabled={!selectedPackage} onPress={handlePurchase}>
              Continue
            </Button>
          </View>
        </View>
      )}
    </ModalView>
  )
}
