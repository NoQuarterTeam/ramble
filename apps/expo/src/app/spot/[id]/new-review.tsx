import { FlashList } from "@shopify/flash-list"
import { useLocalSearchParams } from "expo-router"
import { Heart, Lock } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { TouchableOpacity, View, useColorScheme } from "react-native"

import { Icon } from "~/components/Icon"
import { LoginPlaceholder } from "~/components/LoginPlaceholder"
import { ModalView } from "~/components/ui/ModalView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { type RouterOutputs, api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"

export default function NewSpotReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { me } = useMe()
  // const { data: lists, isLoading } = api.list.allByUserWithSavedSpots.useQuery({ spotId: id }, { enabled: !!me })
  const isLoading = false
  if (!me)
    return (
      <ModalView title="Add a review">
        <LoginPlaceholder text="Log in to add a review" />
      </ModalView>
    )
  return (
    <ModalView title="Add a review">
      {isLoading ? (
        <View className="flex flex-row items-center justify-center pt-6">
          <Spinner />
        </View>
      ) : (
        // <FlashList
        //   showsVerticalScrollIndicator={false}
        //   estimatedItemSize={100}
        //   contentContainerStyle={{ paddingVertical: 10 }}
        //   ListEmptyComponent={<Text>No lists yet</Text>}
        //   data={lists || []}
        //   ItemSeparatorComponent={() => <View className="h-1" />}
        //   renderItem={({ item }) => <SaveableListItem spotId={id} list={item} />}
        // />
      )}
    </ModalView>
  )
  // const colorScheme = useColorScheme()
  // const isDark = colorScheme === "dark"
  // const form = useForm({
  //   defaultValues: { description: props.review?.description || "", spotId: props.spotId, rating: props.review?.rating || 0 },
  // })
  // const rating = form.watch("rating")
  // return (
  //   <FormProvider {...form}>
  //     <FormInput
  //       className="mb-2"
  //       name="description"
  //       label="Be nice, be honest"
  //       placeholder="How was your stay? what did you like?"
  //       numberOfLines={4}
  //       multiline
  //       error={props.error}
  //     />

  //     <View className="mb-4 flex flex-row items-center justify-center space-x-2">
  //       {[1, 2, 3, 4, 5].map((val) => (
  //         <TouchableOpacity key={val} onPress={() => form.setValue("rating", val)}>
  //           <Icon
  //             icon={Star}
  //             strokeWidth={1}
  //             size={50}
  //             fill={rating >= val ? (isDark ? backgroundLight : backgroundDark) : "transparent"}
  //           />
  //         </TouchableOpacity>
  //       ))}
  //     </View>
  //     {props.error?.data?.zodError?.fieldErrors.rating?.map((error) => (
  //       <FormInputError key={error} error={error} />
  //     ))}
  //     <Button isLoading={props.isLoading} onPress={form.handleSubmit(props.review ? props.onUpdate : props.onCreate)}>
  //       Save
  //     </Button>
  //     <FormError className="mb-1" error={props.error} />
  //   </FormProvider>
  // )
}
