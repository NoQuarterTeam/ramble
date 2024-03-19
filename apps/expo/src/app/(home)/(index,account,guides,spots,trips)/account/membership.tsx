import { ScrollView, View } from "react-native"
import { Button } from "~/components/ui/Button"

import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"

export default function Screen() {
  const { data, isLoading, error } = api.user.membership.useQuery()
  return (
    <ScreenView title="membership">
      {isLoading ? (
        <View>
          <Spinner />
        </View>
      ) : error ? null : !data ? (
        <View className="space-y-2">
          <Text className="text-lg">No membership</Text>
          <Button>Join for just €5</Button>
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
  )
}
