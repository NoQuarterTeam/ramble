import { createAssetUrl, useDisclosure } from "@ramble/shared"
import { FlashList } from "@shopify/flash-list"
import { Link, router } from "expo-router"
import { ChevronDown, User } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { Modal, TouchableOpacity, View } from "react-native"
import * as DropdownMenu from "zeego/dropdown-menu"
import { useFeedbackActivity } from "~/components/FeedbackCheck"
import { Icon } from "~/components/Icon"
import { BrandHeading } from "~/components/ui/BrandHeading"
import { Button } from "~/components/ui/Button"
import { ModalView } from "~/components/ui/ModalView"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { Spinner } from "~/components/ui/Spinner"
import { TabView } from "~/components/ui/TabView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { type RouterOutputs, api } from "~/lib/api"
import { isTablet } from "~/lib/device"
import { useAsyncStorage } from "~/lib/hooks/useAsyncStorage"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

const FILTER_OPTIONS: { [key in "guides" | "users"]: string } = {
  guides: "Guides",
  users: "Members",
} as const

export default function UsersScreen() {
  const [filter, setFilter, isReady] = useAsyncStorage<keyof typeof FILTER_OPTIONS>("ramble.users.filter", "guides")
  const { me } = useMe()
  const modalProps = useDisclosure()
  const utils = api.useUtils()

  const { data: initialUsers, isLoading } = api.user.all.useQuery({ skip: 0, filter })

  const { mutate: sendGuideInterest, isPending: isGuideInterestLoading } = api.user.requestGuideStatus.useMutation({
    onSuccess: async () => {
      await utils.user.me.refetch()
      modalProps.onClose()
      toast({ title: "Great!, we'll be in touch soon" })
    },
  })

  const [users, setUsers] = React.useState(initialUsers)

  React.useEffect(() => {
    setUsers(initialUsers)
  }, [initialUsers])

  const handleLoadMore = React.useCallback(async () => {
    const newUsers = await utils.user.all.fetch({ skip: users?.length || 0, filter })
    if (!newUsers || newUsers.length === 0) return
    setUsers([...(users || []), ...newUsers])
  }, [users, utils.user.all, filter])

  const increment = useFeedbackActivity((s) => s.increment)

  const posthog = usePostHog()
  return (
    <TabView
      title={
        isReady ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <TouchableOpacity className="flex flex-row items-center">
                <BrandHeading className="py-2 text-4xl">{FILTER_OPTIONS[filter].toLowerCase()}</BrandHeading>
                <Icon icon={ChevronDown} size={20} color="primary" />
              </TouchableOpacity>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {Object.entries(FILTER_OPTIONS).map(([key, label]) => (
                <DropdownMenu.Item
                  key={key}
                  onSelect={() => {
                    increment()
                    posthog.capture("users list filtered", { filter: label })
                    setFilter(key as keyof typeof FILTER_OPTIONS)
                  }}
                >
                  {label}
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Arrow />
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : (
          <BrandHeading className="py-2 text-4xl"> </BrandHeading>
        )
      }
      rightElement={
        filter === "guides" &&
        me?.role !== "GUIDE" && (
          <Button variant="link" onPress={modalProps.onOpen} className="pr-0">
            Become a guide
          </Button>
        )
      }
    >
      {isLoading ? (
        <View className="flex items-center justify-center p-4">
          <Spinner />
        </View>
      ) : (
        <FlashList
          extraData={{ filter }}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={142}
          onEndReached={handleLoadMore}
          numColumns={isTablet ? 2 : undefined}
          // ListEmptyComponent={<Text className="text-center">No users yet</Text>}
          data={users}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          renderItem={({ item }) => (
            <View style={{ width: "100%", paddingHorizontal: isTablet ? 10 : 0 }}>
              <UserItem user={item} />
            </View>
          )}
        />
      )}
      <Modal
        animationType="slide"
        presentationStyle="formSheet"
        visible={modalProps.isOpen}
        onRequestClose={modalProps.onClose}
        onDismiss={modalProps.onClose}
      >
        <ModalView edges={["top", "bottom"]} title="Become a Guide" onBack={modalProps.onClose}>
          <View className="space-y-6 mt-4">
            <View>
              <Text className="text-xl font-600">What you get as a Guide:</Text>
              <Text className="text-lg">- Get featured the list of Guides</Text>
              <Text className="text-lg">- Ramblers can follow your profile, view your spots and check out your socials</Text>
              <Text className="text-lg">
                - Featured on the Guide list on the Ramble website which links through to your socials
              </Text>
              <Text className="text-lg">- Also featured in our Insta highlight of the Ramble Guides</Text>
              <Text className="text-lg">- Free access to Ramble</Text>
              <Text className="text-lg">- Priority requests of what features you would like to see added to Ramble</Text>
            </View>
            <View>
              <Text className="text-xl font-600">What you need to do:</Text>
              <Text className="text-lg">- Add at least 3 high quality camp spots</Text>
              <Text className="text-lg">- Continue to add at least 1 amazing spot a month</Text>
              <Text className="text-lg">- Endorse Ramble on Instagram once a month</Text>
            </View>
            <Button
              size="lg"
              onPress={() => {
                me ? sendGuideInterest() : router.push("/register")
              }}
              isLoading={isGuideInterestLoading}
              disabled={me?.isPendingGuideApproval}
            >
              I'm interested, lets talk!
            </Button>
          </View>
        </ModalView>
      </Modal>
    </TabView>
  )
}

function UserItem(props: { user: RouterOutputs["user"]["all"][number] }) {
  const increment = useFeedbackActivity((s) => s.increment)
  const tab = useTabSegment()
  return (
    <Link asChild push href={`/${tab}/${props.user.username}/(profile)`}>
      <TouchableOpacity
        onPress={increment}
        activeOpacity={0.8}
        className="space-y-1 rounded-xs border border-gray-200 p-4 dark:border-gray-700"
      >
        <View className="flex flex-row items-center space-x-2">
          {props.user.avatar ? (
            <OptimizedImage
              className="sq-16 rounded-full"
              key={props.user.id}
              width={80}
              height={80}
              placeholder={props.user.avatarBlurHash}
              source={{ uri: createAssetUrl(props.user.avatar) }}
            />
          ) : (
            <View className="sq-16 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
              <Icon icon={User} size={18} />
            </View>
          )}
          <View>
            <Text className="text-xl">
              {props.user.firstName} {props.user.lastName}
            </Text>
            <Text>{props.user.username}</Text>
          </View>
        </View>
        <View className="flex flex-row items-center justify-around gap-4">
          <View className="flex flex-row items-center space-x-1">
            <Text className="font-600">{props.user._count?.createdSpots.toLocaleString()}</Text>
            <Text>spots</Text>
          </View>
          <View className="flex flex-row items-center space-x-1">
            <Text className="font-600">{props.user._count?.followers.toLocaleString()}</Text>
            <Text>followers</Text>
          </View>
          <View className="flex flex-row items-center space-x-1">
            <Text className="font-600">{props.user._count?.createdTrips.toLocaleString()}</Text>
            <Text>trips</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  )
}
