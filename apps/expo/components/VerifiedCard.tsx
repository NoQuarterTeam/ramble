import { TouchableOpacity, View } from "react-native"
import { BadgeX, User2, Verified } from "lucide-react-native"

import { type Spot, type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { useRouter } from "../app/router"
import { Text } from "./ui/Text"
import { OptimizedImage } from "./ui/OptimisedImage"

interface Props {
  spot: Pick<Spot, "verifiedAt"> & { verifier: null | Pick<User, "avatar" | "firstName" | "lastName" | "username"> }
}

export function VerifiedCard({ spot }: Props) {
  const router = useRouter()
  return (
    <>
      {spot.verifiedAt && spot.verifier ? (
        <TouchableOpacity
          onPress={() => router.push("UserScreen", { username: spot.verifier?.username || "" })}
          className="flex flex-row items-center justify-between rounded border border-gray-200 p-2 px-3 dark:border-gray-700"
        >
          <View>
            <View className="flex flex-row items-center space-x-1">
              <Verified className="text-black dark:text-white" />
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
                height={40}
                width={40}
                source={{ uri: createImageUrl(spot.verifier.avatar) }}
                className="sq-10 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
              />
            ) : (
              <View className="sq-10 flex flex-row items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
                <User2 className="text-black dark:text-white" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      ) : (
        <View className="flex flex-row items-center space-x-1">
          <BadgeX size={18} className="text-black dark:text-white" />
          <Text className="text-sm">Unverified</Text>
        </View>
      )}
    </>
  )
}
