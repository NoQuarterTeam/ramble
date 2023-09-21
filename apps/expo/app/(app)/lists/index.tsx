import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { ChevronDown, PlusCircle } from "lucide-react-native"

import { join, useDisclosure } from "@ramble/shared"

import { ListItem } from "../../../components/ListItem"
import { LoginPlaceholder } from "../../../components/LoginPlaceholder"
import { BrandHeading } from "../../../components/ui/BrandHeading"
import { Spinner } from "../../../components/ui/Spinner"
import { TabView } from "../../../components/ui/TabView"
import { Text } from "../../../components/ui/Text"
import { api } from "../../../lib/api"
import { height, width } from "../../../lib/device"
import { useMe } from "../../../lib/hooks/useMe"
import { useRouter } from "../../router"

const SORT_OPTIONS = { mine: "my lists", following: "following" } as const

export function ListsScreen() {
  const sortProps = useDisclosure()
  const [sort, setSort] = React.useState<keyof typeof SORT_OPTIONS>("mine")
  const { me } = useMe()
  const { push } = useRouter()
  const { data: lists, isLoading } = api.list.allByUser.useQuery(
    { username: me?.username || "", showFollowing: sort === "following" || undefined },
    { enabled: !!me },
  )
  if (!me)
    return (
      <TabView title="lists">
        <LoginPlaceholder text="Log in to start saving spots" />
      </TabView>
    )
  return (
    <TabView
      title={
        <TouchableOpacity onPress={sortProps.onOpen} className="flex flex-row items-center">
          <BrandHeading className="py-2 text-4xl">{SORT_OPTIONS[sort]}</BrandHeading>
          <ChevronDown size={20} className="text-primary" />
        </TouchableOpacity>
      }
      rightElement={
        <TouchableOpacity onPress={() => push("NewListScreen")}>
          <PlusCircle className="text-black dark:text-white" />
        </TouchableOpacity>
      }
    >
      {sortProps.isOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={sortProps.onClose}
          className="absolute inset-0 z-10 px-4 pt-[100px]"
          style={{ width, height }}
        >
          <View className="rounded-xs w-[200px] bg-white px-4 py-2 shadow-md dark:bg-gray-950">
            {Object.entries(SORT_OPTIONS).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setSort(key as keyof typeof SORT_OPTIONS)
                  sortProps.onClose()
                }}
              >
                <Text className={join("py-2 text-lg", sort === key && "underline")}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
      {isLoading ? (
        <View className="flex items-center justify-center pt-16">
          <Spinner />
        </View>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={86}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text className="text-center">No lists yet</Text>}
          data={lists}
          ItemSeparatorComponent={() => <View className="h-1" />}
          renderItem={({ item }) => <ListItem list={item} />}
        />
      )}
    </TabView>
  )
}
