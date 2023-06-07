import * as React from "react"
import Constants from "expo-constants"
import * as Updates from "expo-updates"
import { ScrollView, TouchableOpacity, View } from "react-native"

import { createImageUrl } from "@ramble/shared"
import { Image } from "expo-image"
import { useLocalSearchParams } from "expo-router"
import { Bike, Dog, Footprints, Mountain, Settings, Waves } from "lucide-react-native"
import { Button } from "../../components/Button"
import { Heading } from "../../components/Heading"
import { Link } from "../../components/Link"
import { Spinner } from "../../components/Spinner"
import { Text } from "../../components/Text"
import { api } from "../../lib/api"
import { EXPO_PROFILE_TAB_ID, VERSION } from "../../lib/config"
import { SpotItem } from "../../components/SpotItem"

const updateId = Updates.updateId
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateGroup = (Constants.manifest2?.metadata as any)?.["updateGroup"]

type Tab = "spots" | "lists" | "van"

export default function Profile() {
  const { username } = useLocalSearchParams<{ username: string }>()

  const [tab, setTab] = React.useState<Tab>("spots")
  const { data: user, isLoading: isLoadingUser } = api.user.byUsername.useQuery(
    { username: username as string },
    { enabled: !!username && username !== EXPO_PROFILE_TAB_ID },
  )

  // const { data: me, isLoading } = api.auth.me.useQuery()

  return (
    <View className="py-20">
      {!!!username || username === EXPO_PROFILE_TAB_ID ? (
        <View className="space-y-10">
          <Text className="text-lg">Log in to start saving spots</Text>
          <View className="space-y-4">
            <Link asChild href={`/login?profile=true`}>
              <Button>Login</Button>
            </Link>
            <Link asChild href={`/register?profile=true`}>
              <TouchableOpacity>
                <Text className="text-lg">
                  Don't have an account yet? <Text className="text-lg underline">Sign up</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
          <View className="pt-10">
            <Text className="text-center">v{VERSION}</Text>
            <Text className="text-center opacity-60">{updateGroup?.split("-")[0] || updateId?.split("-")[0] || "dev"}</Text>
          </View>
        </View>
      ) : isLoadingUser ? (
        <View className="flex items-center justify-center">
          <Spinner />
        </View>
      ) : user ? (
        <View className="space-y-4">
          <View className="space-y-2 px-4">
            <View className="flex flex-row justify-between">
              <View className="flex flex-row items-center space-x-3">
                <Image
                  source={{ uri: createImageUrl(user.avatar) }}
                  className="sq-24 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
                />
                <View>
                  <Heading className="text-2xl">{user.username}</Heading>
                  <Text className="text-base">
                    {user.firstName} {user.lastName}
                  </Text>
                  <View className="flex flex-row items-center justify-center space-x-2">
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
              <Link asChild href="/account">
                <TouchableOpacity>
                  <Settings size={20} className="text-black dark:text-white" />
                </TouchableOpacity>
              </Link>
            </View>
            <Text>{user.bio}</Text>
          </View>
          <View>
            <View className="flex flex-row items-center justify-center space-x-2 border-b border-gray-100 py-2 dark:border-gray-700">
              <Button size="sm" variant={tab === "spots" ? "secondary" : "ghost"} onPress={() => setTab("spots")}>
                Spots
              </Button>
              <Button size="sm" variant={tab === "van" ? "secondary" : "ghost"} onPress={() => setTab("van")}>
                Van
              </Button>
            </View>
            <View className="p-2">
              {tab === "spots" && <ProfileSpots username={username} />}
              {tab === "van" && <ProfileVan username={username} />}
            </View>
          </View>
        </View>
      ) : (
        <View>
          <Text>User not found</Text>
        </View>
      )}
    </View>
  )
}

function ProfileSpots({ username }: { username: string }) {
  const { data: spots, isLoading: isLoadingSpots } = api.spot.byUsername.useQuery({ username })
  if (isLoadingSpots)
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
    <ScrollView contentContainerStyle={{ marginBottom: 300 }} style={{ marginBottom: 300 }}>
      {spots.map((spot) => (
        <SpotItem key={spot.id} spot={{ ...spot, image: spot.images[0]?.path }} />
      ))}
    </ScrollView>
  )
}

function ProfileVan({ username }: { username: string }) {
  return (
    <View>
      <Text>Van</Text>
    </View>
  )
}
