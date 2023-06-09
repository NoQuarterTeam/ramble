import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image"
import { Link, useNavigation, useSegments } from "expo-router"
import { Bike, ChevronLeft, Dog, Footprints, Mountain, Settings, Waves } from "lucide-react-native"

import { createImageUrl } from "@ramble/shared"

import { api } from "../lib/api"
import { useMe } from "../lib/hooks/useMe"
import { Button } from "./Button"
import { Heading } from "./Heading"
import { Spinner } from "./Spinner"
import { SpotItem } from "./SpotItem"
import { Text } from "./Text"

interface Props {
  username: string
}

type Tab = "spots" | "lists" | "van"

export function UserProfile(props: Props) {
  const [tab, setTab] = React.useState<Tab>("spots")
  const { me } = useMe()
  const navigation = useNavigation()

  const segments = useSegments()
  const isPublicProfileTab = segments.find((s) => s === "[username]")

  const { data: user, isLoading } = api.user.profile.useQuery({ username: props.username })

  if (isLoading)
    return (
      <View className="flex items-center justify-center py-20">
        <Spinner />
      </View>
    )

  if (!user)
    return (
      <View className="px-4 py-20">
        <Text>User not found</Text>
      </View>
    )

  return (
    <View className="pt-16">
      <View className="flex flex-row items-center justify-between px-6 pb-2">
        <View className="flex flex-row items-center space-x-2">
          {navigation.canGoBack() && isPublicProfileTab && (
            <TouchableOpacity onPress={navigation.goBack} activeOpacity={0.8}>
              <ChevronLeft className="text-black dark:text-white" />
            </TouchableOpacity>
          )}
          <Heading className="font-700 text-2xl">{user.username}</Heading>
        </View>

        {me?.id === user.id && !isPublicProfileTab && (
          <Link asChild href="/account">
            <TouchableOpacity className="flex w-10 flex-row justify-end">
              <Settings size={20} className="text-black dark:text-white" />
            </TouchableOpacity>
          </Link>
        )}
      </View>
      <ScrollView className="min-h-full" stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-2">
          <View className="flex flex-row items-center space-x-3">
            <Image
              source={{ uri: createImageUrl(user.avatar) }}
              className="sq-20 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
            />
            <View className="space-y-px">
              <Text className="text-xl">
                {user.firstName} {user.lastName}
              </Text>

              <View className="flex flex-row items-center space-x-2">
                {user.isPetOwner && (
                  <View className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                    <Dog size={20} className="text-black dark:text-white" />
                  </View>
                )}
                {user.isClimber && (
                  <View className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                    <Mountain size={20} className="text-black dark:text-white" />
                  </View>
                )}
                {user.isHiker && (
                  <View className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                    <Footprints size={20} className="text-black dark:text-white" />
                  </View>
                )}
                {user.isMountainBiker && (
                  <View className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                    <Bike size={20} className="text-black dark:text-white" />
                  </View>
                )}
                {user.isPaddleBoarder && (
                  <View className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                    <Waves size={20} className="text-black dark:text-white" />
                  </View>
                )}
              </View>
            </View>
          </View>
          <Text>{user.bio}</Text>
        </View>

        <View className="flex flex-row items-center justify-center space-x-2 border-b border-gray-100 bg-white py-2 dark:border-gray-800 dark:bg-black">
          <Button size="sm" variant={tab === "spots" ? "secondary" : "ghost"} onPress={() => setTab("spots")}>
            Spots
          </Button>
          <Button size="sm" variant={tab === "van" ? "secondary" : "ghost"} onPress={() => setTab("van")}>
            Van
          </Button>
          <Button size="sm" variant={tab === "lists" ? "secondary" : "ghost"} onPress={() => setTab("lists")}>
            Lists
          </Button>
        </View>
        <View className="p-2">
          {tab === "spots" && <ProfileSpots username={user.username} />}
          {tab === "van" && <ProfileVan username={user.username} />}
          {tab === "lists" && <ProfileLists username={user.username} />}
        </View>
      </ScrollView>
    </View>
  )
}

function ProfileSpots({ username }: { username: string }) {
  const { data: spots, isLoading } = api.user.spots.useQuery({ username })
  if (isLoading)
    return (
      <View className="flex items-center justify-center py-4">
        <Spinner />
      </View>
    )

  if (!spots)
    return (
      <View className="flex items-end justify-center py-4">
        <Text>No spots found</Text>
      </View>
    )

  return (
    <View className="space-y-1">
      {spots.map((spot) => (
        <View key={spot.id}>
          <SpotItem spot={spot} />
        </View>
      ))}
    </View>
  )
}

function ProfileVan({ username }: { username: string }) {
  const { data: van, isLoading } = api.user.van.useQuery({ username })
  if (isLoading)
    return (
      <View className="flex items-center justify-center py-4">
        <Spinner />
      </View>
    )

  if (!van)
    return (
      <View className="flex items-end justify-center py-4">
        <Text>No van yet</Text>
      </View>
    )

  return (
    <View className="space-y-2">
      <Text className="text-2xl">{van.name}</Text>
      <Text>{van.model}</Text>
      <Text>{van.year}</Text>
      <Text>{van.description}</Text>
      {van.images.map((image) => (
        <Image key={image.id} className="h-[300px] w-full rounded-lg object-cover" source={{ uri: createImageUrl(image.path) }} />
      ))}
    </View>
  )
}
function ProfileLists({ username }: { username: string }) {
  const { data: lists, isLoading } = api.user.lists.useQuery({ username })
  if (isLoading)
    return (
      <View className="flex items-center justify-center py-4">
        <Spinner />
      </View>
    )

  if (!lists)
    return (
      <View className="flex items-end justify-center py-4">
        <Text>No lists yet</Text>
      </View>
    )

  return (
    <View className="space-y-1">
      {lists.map((list) => (
        <Link asChild key={list.id} href={`/${username}/lists/${list.id}`}>
          <TouchableOpacity activeOpacity={0.8} className="rounded-lg border border-gray-100 p-4 dark:border-gray-700">
            <Text className="text-xl">{list.name}</Text>
            <Text className="text-base">{list.description}</Text>
          </TouchableOpacity>
        </Link>
      ))}
    </View>
  )
}
