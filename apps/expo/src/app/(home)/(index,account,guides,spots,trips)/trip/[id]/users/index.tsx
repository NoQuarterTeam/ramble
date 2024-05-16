import { Link, useLocalSearchParams, useRouter } from "expo-router"
import { Trash, User2 } from "lucide-react-native"
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from "react-native"

import { createAssetUrl, join } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { ModalView } from "~/components/ui/ModalView"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { Text } from "~/components/ui/Text"
import { type RouterOutputs, api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

export default function TripUsers() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isLoading } = api.trip.usersV2.all.useQuery({ tripId: id }, { enabled: !!id })
  const users = data?.users
  const { me } = useMe()
  const isCreator = me?.id === data?.creatorId
  const router = useRouter()
  const utils = api.useUtils()
  const { mutate } = api.trip.usersV2.remove.useMutation({
    onSuccess: () => {
      router.back()
      router.back()
      void utils.trip.mine.refetch()
    },
  })

  const handleRemove = () => {
    if (!me || !id) return
    Alert.alert("Leave trip", "Are you sure you want to be removed from this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          mutate({ tripId: id, userId: me.id })
        },
      },
    ])
  }

  const tab = useTabSegment()
  return (
    <ModalView title="users on trip">
      <ScrollView className="flex-1 space-y-2" keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        {isLoading ? (
          <View className="flex items-center justify-center p-4">
            <ActivityIndicator />
          </View>
        ) : !users ? null : users.length === 0 ? (
          <Text>Not currently shared with anyone</Text>
        ) : (
          <>
            {users.map((user) => (
              <UserItem key={user.id} user={user} trip={data} />
            ))}
          </>
        )}
        {isCreator ? (
          <Link asChild push href={`/${tab}/trip/${id}/users/add`}>
            <Button size="sm" variant="secondary">
              Add users
            </Button>
          </Link>
        ) : (
          <Button size="sm" variant="secondary" onPress={handleRemove}>
            Leave trip
          </Button>
        )}
      </ScrollView>
    </ModalView>
  )
}

function UserItem({
  user,
  trip,
}: { trip: RouterOutputs["trip"]["users"]["all"]; user: RouterOutputs["trip"]["users"]["all"]["users"][number] }) {
  const { me } = useMe()

  const isCreator = user.id === trip.creatorId
  const utils = api.useUtils()
  const { mutate, isPending: isLoading } = api.trip.users.remove.useMutation({
    onMutate: () => {
      utils.trip.users.all.setData({ tripId: trip.id }, (prev) => {
        if (!prev) return prev
        return { ...prev, users: prev.users.filter((u) => u.id !== user.id) }
      })
    },
    onSuccess: () => {
      void utils.trip.usersV2.all.refetch({ tripId: trip.id })
    },
  })

  const handleRemove = () => {
    Alert.alert("Remove user", `Are you sure you want to remove ${user.username} from this trip?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          mutate({ tripId: trip.id, userId: user.id })
        },
      },
    ])
  }
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      disabled={isLoading || me?.id !== trip.creatorId || isCreator}
      className={join("flex flex-row items-center justify-between pb-2", isLoading && "opacity-60")}
      onPress={handleRemove}
    >
      <View className="flex flex-row items-center space-x-2">
        {user.avatar ? (
          <OptimizedImage
            height={50}
            width={50}
            placeholder={user.avatarBlurHash}
            source={{ uri: createAssetUrl(user.avatar) }}
            className="sq-12 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
          />
        ) : (
          <View className="sq-12 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
            <Icon icon={User2} />
          </View>
        )}
        <View>
          <Text className="font-600">{user.username}</Text>
          <Text>
            {user.firstName} {user.lastName}
          </Text>
        </View>
      </View>
      {me?.id !== trip.creatorId || isCreator ? null : isLoading ? <ActivityIndicator /> : <Icon icon={Trash} size={16} />}
    </TouchableOpacity>
  )
}
