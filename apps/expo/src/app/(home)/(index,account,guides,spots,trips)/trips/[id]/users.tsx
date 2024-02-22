import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from "react-native"
import { Link, useLocalSearchParams } from "expo-router"
import { Trash, User2 } from "lucide-react-native"

import { createImageUrl, join } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { ModalView } from "~/components/ui/ModalView"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { Text } from "~/components/ui/Text"
import { api, type RouterOutputs } from "~/lib/api"

export default function TripUsers() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isLoading } = api.trip.users.useQuery({ id })
  const users = data?.users

  return (
    <ModalView title="users on trip">
      <ScrollView className="flex-1 space-y-2">
        {isLoading ? (
          <View className="flex items-center justify-center p-4">
            <ActivityIndicator />
          </View>
        ) : !users ? null : users.length === 0 ? (
          <Text>Not currently shared with anyone</Text>
        ) : (
          <>
            {users.map((user) => (
              <UserItem key={user.id} user={user} />
            ))}
          </>
        )}
        <Link asChild push href={`/(home)/(trips)/trips/${id}/add-users`}>
          <Button size="sm" variant="secondary">
            Add users
          </Button>
        </Link>
      </ScrollView>
    </ModalView>
  )
}

function UserItem({ user }: { user: RouterOutputs["trip"]["users"]["users"][number] }) {
  const { id } = useLocalSearchParams<{ id: string }>()
  const utils = api.useUtils()
  const { mutate, isLoading } = api.trip.removeUser.useMutation({
    onMutate: () => {
      utils.trip.users.setData({ id }, (prev) => {
        if (!prev) return prev
        return { ...prev, users: prev.users.filter((u) => u.id !== user.id) }
      })
    },
    onSuccess: () => {
      void utils.trip.users.refetch({ id })
    },
  })

  const handleRemove = () => {
    Alert.alert("Remove user", `Are you sure you want to remove ${user.username} from this trip?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          mutate({ tripId: id, userId: user.id })
        },
      },
    ])
  }
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      disabled={isLoading}
      className={join("flex flex-row items-center justify-between pb-2", isLoading && "opacity-60")}
      onPress={handleRemove}
    >
      <View className="flex flex-row items-center space-x-2">
        {user.avatar ? (
          <OptimizedImage
            height={50}
            width={50}
            placeholder={user.avatarBlurHash}
            source={{ uri: createImageUrl(user.avatar) }}
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
      {isLoading ? <ActivityIndicator /> : <Icon icon={Trash} size={16} />}
    </TouchableOpacity>
  )
}
