import { FlashList } from "@shopify/flash-list"
import { Link } from "expo-router"
import * as React from "react"
import { TouchableOpacity, View } from "react-native"

import { createAssetUrl } from "@ramble/shared"

import { useFeedbackActivity } from "~/components/FeedbackCheck"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { Spinner } from "~/components/ui/Spinner"
import { TabView } from "~/components/ui/TabView"
import { Text } from "~/components/ui/Text"
import { type RouterOutputs, api } from "~/lib/api"
import { isTablet } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"

export default function GuidesScreen() {
  const { me } = useMe()

  const { data, isLoading } = api.user.guides.useQuery({ skip: 0 }, { enabled: !!me })

  const [guides, setGuides] = React.useState(data)

  React.useEffect(() => {
    setGuides(guides)
  }, [guides])

  const utils = api.useUtils()
  const handleLoadMore = React.useCallback(async () => {
    const newGuides = await utils.user.guides.fetch({ skip: guides?.length || 0 })
    setGuides([...(guides || []), ...newGuides])
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
        <View className="flex items-center justify-center p-4">
          <Spinner />
        </View>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          estimatedItemSize={142}
          onEndReached={handleLoadMore}
          numColumns={isTablet ? 2 : undefined}
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
  const increment = useFeedbackActivity((s) => s.increment)
  return (
    <Link asChild push href={`/(home)/(guides)/${props.guide.username}/(profile)`}>
      <TouchableOpacity
        onPress={increment}
        activeOpacity={0.8}
        className="space-y-1 rounded-xs border border-gray-200 p-4 dark:border-gray-700"
      >
        <View className="flex flex-row items-center space-x-2">
          <OptimizedImage
            className="sq-16 rounded-full"
            width={80}
            height={80}
            placeholder={props.guide.avatarBlurHash}
            source={{ uri: createAssetUrl(props.guide.avatar) }}
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
            <Text className="font-600">{props.guide._count?.createdSpots.toLocaleString()}</Text>
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
    </Link>
  )
}
