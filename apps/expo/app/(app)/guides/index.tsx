import * as React from "react"
import { TouchableOpacity, View } from "react-native"
import { FlashList } from "@shopify/flash-list"

import { createImageUrl } from "@ramble/shared"

import { LoginPlaceholder } from "../../../components/LoginPlaceholder"
import { OptimizedImage } from "../../../components/ui/OptimisedImage"
import { Spinner } from "../../../components/ui/Spinner"
import { TabView } from "../../../components/ui/TabView"
import { Text } from "../../../components/ui/Text"
import { api, type RouterOutputs } from "../../../lib/api"
import { isTablet } from "../../../lib/device"
import { useMe } from "../../../lib/hooks/useMe"
import { useRouter } from "../../router"

export function GuidesScreen() {
  const { me } = useMe()

  const { data: initialGuides, isLoading } = api.user.guides.useQuery({ skip: 0 }, { enabled: !!me })

  const [guides, setGuides] = React.useState(initialGuides)

  React.useEffect(() => {
    setGuides(initialGuides)
  }, [initialGuides])

  const utils = api.useUtils()
  const handleLoadMore = React.useCallback(async () => {
    const newSpots = await utils.user.guides.fetch({ skip: guides?.length || 0 })
    setGuides([...(guides || []), ...newSpots])
  }, [guides, utils.user.guides])

  if (!me)
    return (
      <TabView title="guides">
        <LoginPlaceholder text="Log in to view guides" />
      </TabView>
    )
  return (
    <TabView title="guides">
      {isLoading ? (
        <View className="flex items-center justify-center pt-16">
          <Spinner />
        </View>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={142}
          onEndReached={handleLoadMore}
          numColumns={isTablet ? 2 : undefined}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={<Text className="text-center">No guides yet</Text>}
          data={guides}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          renderItem={({ item }) => (
            <View style={{ width: "100%", paddingHorizontal: isTablet ? 10 : 0 }}>
              <GuideItem guide={item} />
            </View>
          )}
        />
      )}
    </TabView>
  )
}

function GuideItem(props: { guide: RouterOutputs["user"]["guides"][number] }) {
  const router = useRouter()
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push("UserScreen", { username: props.guide.username })}
      className="rounded-xs space-y-1 border border-gray-100 p-4 dark:border-gray-700"
    >
      <View className="flex flex-row items-center space-x-2">
        <OptimizedImage
          className="sq-16 rounded-full"
          width={80}
          height={80}
          placeholder={props.guide.avatarBlurHash}
          source={{ uri: createImageUrl(props.guide.avatar) }}
        />
        <View>
          <Text className="text-xl">
            {props.guide.firstName} {props.guide.lastName}
          </Text>
          <Text>{props.guide.username}</Text>
        </View>
      </View>
      <View className="flex flex-row items-center justify-around gap-4">
        <View className="flex flex-row items-center space-x-1">
          <Text className="font-600">{props.guide._count?.verifiedSpots.toLocaleString()}</Text>
          <Text>spots</Text>
        </View>
        <View className="flex flex-row items-center space-x-1">
          <Text className="font-600">{props.guide._count?.followers.toLocaleString()}</Text>
          <Text>followers</Text>
        </View>
        <View className="flex flex-row items-center space-x-1">
          <Text className="font-600">{props.guide._count?.lists.toLocaleString()}</Text>
          <Text>lists</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
