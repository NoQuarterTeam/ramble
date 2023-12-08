import * as React from "react"
import { TouchableOpacity, View, useColorScheme } from "react-native"
import { FlashList } from "@shopify/flash-list"
import { ChevronDown, PlusCircle } from "lucide-react-native"

import { join, useDisclosure } from "@ramble/shared"

import { Icon } from "../../../components/Icon"
import { ListItem } from "../../../components/ListItem"
import { LoginPlaceholder } from "../../../components/LoginPlaceholder"
import { BrandHeading } from "../../../components/ui/BrandHeading"
import { Spinner } from "../../../components/ui/Spinner"
import { TabView } from "../../../components/ui/TabView"
import { Text } from "../../../components/ui/Text"
import { api } from "../../../lib/api"
import { height, isTablet, width } from "../../../lib/device"
import { useMe } from "../../../lib/hooks/useMe"
import { useRouter } from "../../router"

const SORT_OPTIONS = { mine: "my lists", following: "following" } as const

export function ListsScreen() {
  const sortProps = useDisclosure()
  const [sort, setSort] = React.useState<keyof typeof SORT_OPTIONS>("mine")
  const { me } = useMe()
  const isDark = useColorScheme() === "dark"
  const { push } = useRouter()
  const { data: lists, isLoading } = api.list.allByUser.useQuery(
    { username: me?.username || "", showFollowing: sort === "following" || undefined },
    { enabled: !!me },
  )
  if (!me)
    return (
      <TabView title="lists">
        <LoginPlaceholder text="Log in to create lists" />
      </TabView>
    )
  return (
    <TabView
      title={
        <TouchableOpacity onPress={sortProps.onOpen} className="flex flex-row items-center">
          <BrandHeading className="py-2 text-4xl">{SORT_OPTIONS[sort]}</BrandHeading>
          <Icon icon={ChevronDown} size={20} color="primary" />
        </TouchableOpacity>
      }
      rightElement={
        <TouchableOpacity onPress={() => push("NewListScreen")}>
          <Icon icon={PlusCircle} />
        </TouchableOpacity>
      }
    >
      {sortProps.isOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={sortProps.onClose}
          className="absolute inset-0 z-10 px-4 pt-[110px]"
          style={{ width, height }}
        >
          <View
            style={{
              shadowOffset: { width: 0, height: 5 },
              shadowRadius: 10,
              shadowColor: isDark ? "black" : "gray",
              shadowOpacity: isDark ? 0.7 : 0.5,
            }}
            className="bg-background dark:bg-background-dark w-[200px] rounded-sm px-4 py-2"
          >
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
          numColumns={isTablet ? 2 : undefined}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text className="text-center">No lists yet</Text>}
          data={lists}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          renderItem={({ item }) => (
            <View style={{ width: "100%", paddingHorizontal: isTablet ? 10 : 0 }}>
              <ListItem list={item} />
            </View>
          )}
        />
      )}
    </TabView>
  )
}
