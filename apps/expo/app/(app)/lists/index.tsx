import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { PlusCircle } from "lucide-react-native"

import { ListItem } from "../../../components/ListItem"
import { LoginPlaceholder } from "../../../components/LoginPlaceholder"
import { TabView } from "../../../components/ui/TabView"
import { Text } from "../../../components/ui/Text"
import { api } from "../../../lib/api"
import { useMe } from "../../../lib/hooks/useMe"
import { useRouter } from "../../router"

export function ListsScreen() {
  const { me } = useMe()
  const { push } = useRouter()
  const { data: lists } = api.list.allByUser.useQuery({ username: me?.username || "" }, { enabled: !!me })
  if (!me)
    return (
      <TabView title="Lists">
        <LoginPlaceholder text="Log in to start saving spots" />
      </TabView>
    )
  return (
    <TabView
      title="Lists"
      rightElement={
        <TouchableOpacity onPress={() => push("NewListScreen")}>
          <PlusCircle className="text-black dark:text-white" />
        </TouchableOpacity>
      }
    >
      <FlashList
        showsVerticalScrollIndicator={false}
        estimatedItemSize={86}
        contentContainerStyle={{ paddingVertical: 10 }}
        ListEmptyComponent={<Text className="text-center">No lists yet</Text>}
        data={lists}
        ItemSeparatorComponent={() => <View className="h-1" />}
        renderItem={({ item }) => <ListItem list={item} />}
      />
    </TabView>
  )
}
