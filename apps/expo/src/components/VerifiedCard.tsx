import { TouchableOpacity, View } from "react-native"
import { BadgeX, User2, Verified } from "lucide-react-native"

import { type Spot, type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { useMe } from "~/lib/hooks/useMe"
import { Icon } from "./Icon"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
import { useRouter } from "expo-router"

interface Props {
  spot: Pick<Spot, "verifiedAt"> & {
    verifier: null | Pick<User, "avatar" | "avatarBlurHash" | "firstName" | "lastName" | "username">
  }
}

export function VerifiedCard({ spot }: Props) {
  const { me } = useMe()
  const router = useRouter()
  const tab = useTabSegment()
  return (
    <>
      {spot.verifiedAt && spot.verifier ? (
        <TouchableOpacity
          onPress={me ? () => router.push(`/${tab}/${spot.verifier!.username}/(profile)`) : () => router.push("/login")}
          className="rounded-xs flex flex-row items-center justify-between border border-gray-200 p-1.5 px-2.5 dark:border-gray-700/70"
        >
          <View>
            <View className="flex flex-row items-center space-x-1">
              <Icon icon={Verified} />
              <Text>
                Verified by{" "}
                <Text className="font-500 ">
                  {spot.verifier.firstName} {spot.verifier.lastName}
                </Text>
              </Text>
            </View>
          </View>

          <View>
            {spot.verifier.avatar ? (
              <OptimizedImage
                height={36}
                width={36}
                placeholder={spot.verifier.avatarBlurHash}
                source={{ uri: createImageUrl(spot.verifier.avatar) }}
                className="sq-9 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
              />
            ) : (
              <View className="sq-10 flex flex-row items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
                <Icon icon={User2} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <View className="flex flex-row items-center space-x-1">
          <Icon icon={BadgeX} size={18} />
          <Text className="text-sm">Unverified</Text>
        </View>
      )}
    </>
  )
}
