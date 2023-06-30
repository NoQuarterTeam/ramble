import { View, TouchableOpacity } from "react-native"

import { FlashList } from "@shopify/flash-list"
import { PlusCircle } from "lucide-react-native"

import { ListItem } from "../../../components/ListItem"
import { LoginPlaceholder } from "../../../components/LoginPlaceholder"
import { Heading } from "../../../components/ui/Heading"
import { Text } from "../../../components/ui/Text"
import { api } from "../../../lib/api"
import { useMe } from "../../../lib/hooks/useMe"
import { useRouter } from "../../router"

export function ListsScreen() {
  const { me } = useMe()
  const { push } = useRouter()
  const { data: lists } = api.list.allByUser.useQuery({ username: me?.username || "" }, { enabled: !!me })
  if (!me) return <LoginPlaceholder title="Lists" text="Log in to start saving spots" />
  return (
    <View className="h-full">
      <View className="relative flex-1 px-4 pt-20">
        <View className="flex flex-row justify-between">
          <Heading className="pb-1 text-3xl">Lists</Heading>
          <TouchableOpacity onPress={() => push("NewListScreen")} className="p-2">
            <PlusCircle className="text-black dark:text-white" />
          </TouchableOpacity>
        </View>

        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={86}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text className="text-center">No lists yet</Text>}
          data={lists || []}
          ItemSeparatorComponent={() => <View className="h-1" />}
          renderItem={({ item }) => <ListItem list={item} />}
        />
      </View>
    </View>
  )
}
