import { useLocalSearchParams } from "expo-router"
import { User2 } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native"

import { createAssetUrl, join } from "@ramble/shared"

import { keepPreviousData } from "@tanstack/react-query"
import { Icon } from "~/components/Icon"
import { Input } from "~/components/ui/Input"
import { ModalView } from "~/components/ui/ModalView"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { type RouterOutputs, api } from "~/lib/api"

export default function AddTripUsers() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [search, setSearch] = React.useState("")
  const { data, isLoading, refetch } = api.trip.usersV2.search.useQuery(
    { tripId: id, search, skip: 0 },
    { enabled: !!search, placeholderData: keepPreviousData },
  )
  const users = data

  return (
    <ModalView title="add users" shouldRenderToast>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        className="flex-1 space-y-2"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View className="bg-background pb-2 dark:bg-background-dark">
          <Input value={search} onChangeText={setSearch} placeholder="Search " />
        </View>
        {search && isLoading ? (
          <View className="flex items-center justify-center p-4">
            <ActivityIndicator />
          </View>
        ) : !users || !search ? null : users.length === 0 ? (
          <Text>No users found</Text>
        ) : (
          <>
            {users.map((user) => (
              <UserItem key={user.id} user={user} onSelect={refetch} />
            ))}
          </>
        )}
      </ScrollView>
    </ModalView>
  )
}

function UserItem({
  user,

  onSelect,
}: {
  onSelect: () => void
  user: RouterOutputs["trip"]["usersV2"]["search"][number]
}) {
  const { id } = useLocalSearchParams<{ id: string }>()
  const utils = api.useUtils()
  const { mutate, isPending } = api.trip.usersV2.add.useMutation({
    onSuccess: async () => {
      onSelect()
      void utils.trip.mine.refetch()
      await utils.trip.usersV2.all.refetch({ tripId: id })
      toast({ title: "User added", type: "success" })
    },
  })
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      disabled={isPending}
      className={join("flex flex-row items-center justify-between pb-2", isPending && "opacity-60")}
      onPress={() => mutate({ tripId: id, userId: user.id })}
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
      {isPending && <ActivityIndicator />}
    </TouchableOpacity>
  )
}
