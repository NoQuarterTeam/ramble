import { FlashList } from "@shopify/flash-list"
import { useRouter } from "expo-router"
import { ChevronDown, PlusCircle } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import * as DropdownMenu from "zeego/dropdown-menu"

import { Icon } from "~/components/Icon"
import { ListItem } from "~/components/ListItem"
import { SignupCta } from "~/components/SignupCta"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { isTablet } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"

const SORT_OPTIONS = { mine: "My lists", following: "Following" } as const

export default function ListsScreen() {
  const [sort, setSort] = React.useState<keyof typeof SORT_OPTIONS>("mine")
  const { me } = useMe()

  const router = useRouter()
  const { data: lists, isLoading } = api.list.allByUser.useQuery(
    { username: me?.username || "", showFollowing: sort === "following" || undefined },
    { enabled: !!me },
  )
  const posthog = usePostHog()
  if (!me)
    return (
      <ScreenView title="lists">
        <SignupCta text="Sign up to create lists" />
      </ScreenView>
    )
  return (
    <ScreenView
      title={
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <TouchableOpacity className="flex flex-row items-center">
              <BrandHeading className="text-xl">{SORT_OPTIONS[sort].toLowerCase()}</BrandHeading>
              <Icon className="mt-1" icon={ChevronDown} size={20} color="primary" />
            </TouchableOpacity>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {Object.entries(SORT_OPTIONS).map(([key, label]) => (
              <DropdownMenu.Item
                onSelect={() => {
                  posthog.capture("lists list sorted", { sort: label })
                  setSort(key as keyof typeof SORT_OPTIONS)
                }}
                key={key}
              >
                {label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      }
      rightElement={
        <TouchableOpacity onPress={() => router.push("/(home)/(account)/account/lists/new")}>
          <Icon icon={PlusCircle} />
        </TouchableOpacity>
      }
    >
      {isLoading ? (
        <View className="flex items-center justify-center p-4">
          <Spinner />
        </View>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={86}
          numColumns={isTablet ? 2 : undefined}
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
    </ScreenView>
  )
}
