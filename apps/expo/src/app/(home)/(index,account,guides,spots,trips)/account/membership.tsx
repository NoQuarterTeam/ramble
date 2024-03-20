import { PlatformPay, PlatformPayButton, StripeProvider, createPlatformPayPaymentMethod } from "@stripe/stripe-react-native"

import { Alert, ScrollView, View } from "react-native"

import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { IS_PRODUCTION } from "~/lib/config"

export default function Screen() {
  const { data, isLoading, error } = api.user.membership.useQuery()
  return (
    <StripeProvider
      publishableKey={
        IS_PRODUCTION
          ? "pk_live_51Ow2sHJ4RkWCle62G72BGhXVHUTUzu3WQX5IFWEfJ8UwWUL9P6KqOEZLynfHy40f8N0NTFs6JnAXOehUAtc2P5Vd00JL43qa3F"
          : "pk_test_51Ow2sHJ4RkWCle62YTaQGEawPAPY0BP7xtnHJTmiRrmlrKWWfPZv4ggmj0rYkz8qFSQuVAwfxoj6vROFhA4JISkf00JRb2QUTQ"
      }
      urlScheme="ramble"
      merchantIdentifier={IS_PRODUCTION ? "merchant.co.noquarter.ramble" : "merchant.co.noquarter.ramble.dev"}
    >
      <ScreenView title="membership">
        {isLoading ? (
          <View>
            <Spinner />
          </View>
        ) : error ? null : !data ? (
          <View className="space-y-2">
            <Text className="text-lg">No membership</Text>
            <PlatformPayButton
              style={{
                width: "65%",
                height: 50,
                marginTop: 20,
                alignSelf: "center",
              }}
              type={PlatformPay.ButtonType.Subscribe}
              appearance={PlatformPay.ButtonStyle.Black}
              borderRadius={4}
              onPress={async () => {
                const { error } = await createPlatformPayPaymentMethod({
                  applePay: {
                    cartItems: [
                      {
                        amount: "5",
                        label: "Thing",
                        paymentType: PlatformPay.PaymentType.Recurring,
                        intervalCount: 1,
                        intervalUnit: PlatformPay.IntervalUnit.Month,
                      },
                    ],
                    merchantCountryCode: "NL",
                    currencyCode: "EUR",
                  },
                  googlePay: {
                    currencyCode: "EUR",
                    amount: 5,
                    merchantCountryCode: "NL",
                    testEnv: !IS_PRODUCTION,
                  },
                })
                if (error) {
                  Alert.alert(error.code, error.localizedMessage)
                }
              }}
            />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <Text>{data.discountPercent}</Text>
            <Text>{data.status}</Text>
            {data.items.map((item) => (
              <View key={item.id}>
                <Text>{item.price.unit_amount}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </ScreenView>
    </StripeProvider>
  )
}
