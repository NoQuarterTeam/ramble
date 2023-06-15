import { View } from "react-native"
import { Heading } from "../../components/Heading"
import { useMe } from "../../lib/hooks/useMe"
import { Text } from "../../components/Text"

import { LoginPlaceholder } from "../../components/LoginPlaceholder"
import { api } from "../../lib/api"
import { ListItem } from "../../components/ListItem"
import { FlashList } from "@shopify/flash-list"

export default function Lists() {
  const { me } = useMe()
  const { data: lists } = api.user.lists.useQuery({ username: me?.username || "" }, { enabled: !!me })
  if (!me) return <LoginPlaceholder title="Lists" text="Log in to start saving spots" />
  return (
    <View className="h-full">
      <View className="relative flex-1 px-4 pt-20">
        <Heading className="pb-1 text-3xl">Lists</Heading>

        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={86}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text>Empty</Text>}
          data={lists || []}
          ItemSeparatorComponent={() => <View className="h-1" />}
          renderItem={({ item }) => <ListItem list={item} />}
        />
      </View>
    </View>
  )
}
