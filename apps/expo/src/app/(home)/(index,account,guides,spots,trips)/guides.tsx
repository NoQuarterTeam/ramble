import { FlashList } from "@shopify/flash-list"
import { Link, router } from "expo-router"
import * as React from "react"
import { Modal, TouchableOpacity, View } from "react-native"

import { createAssetUrl, useDisclosure } from "@ramble/shared"

import { useFeedbackActivity } from "~/components/FeedbackCheck"
import { Button } from "~/components/ui/Button"
import { ModalView } from "~/components/ui/ModalView"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { Spinner } from "~/components/ui/Spinner"
import { TabView } from "~/components/ui/TabView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { type RouterOutputs, api } from "~/lib/api"
import { isTablet } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"

export default function GuidesScreen() {
  const { me } = useMe()
  const modalProps = useDisclosure()
  const utils = api.useUtils()

  const { data, isLoading } = api.user.guides.useQuery({ skip: 0 })
  const { mutate: sendGuideInterest, isPending: isGuideInterestLoading } = api.user.requestGuideStatus.useMutation({
    onSuccess: async () => {
      await utils.user.me.refetch()
      modalProps.onClose()
      toast({ title: "Great!, we'll be in touch soon" })
    },
  })

  const [guides, setGuides] = React.useState(data)

  React.useEffect(() => {
    setGuides(guides)
  }, [guides])

  const handleLoadMore = React.useCallback(async () => {
    const newGuides = await utils.user.guides.fetch({ skip: guides?.length || 0 })
    setGuides([...(guides || []), ...newGuides])
  }, [guides, utils.user.guides])

  return (
    <TabView
      title="guides"
      rightElement={
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
              <Text className="text-lg">- Featured on the Guide list on the Ramble website which links through to your socials</Text>
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
            <Text className="font-600">{props.guide._count?.createdTrips.toLocaleString()}</Text>
            <Text>trips</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  )
}


