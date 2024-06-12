import { Link, useRouter } from "expo-router"
import * as React from "react"
import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"
import { AvoidSoftInputView } from "react-native-avoid-softinput"

import { SafeAreaView } from "~/components/SafeAreaView"
import { Button } from "~/components/ui/Button"
import { FormInput } from "~/components/ui/FormInput"
import { Heading } from "~/components/ui/Heading"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { api } from "~/lib/api"
import { useForm } from "~/lib/hooks/useForm"
import { useMe } from "~/lib/hooks/useMe"

const MAX_TAGS = 5

export default function OnboardingStep1Screen() {
  const { me } = useMe()
  const form = useForm({ defaultValues: { bio: me?.bio || "" } })
  const router = useRouter()
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([])

  const { data: tags, isLoading: isTagsLoading } = api.user.tagOptions.useQuery()

  const utils = api.useUtils()
  const {
    mutate,
    isPending: isLoading,
    error,
  } = api.user.update.useMutation({
    onSuccess: async () => {
      await utils.user.me.refetch()
      await utils.user.myTags.refetch()
      router.push("/onboarding/2")
    },
  })

  const onSubmit = form.handleSubmit((data) =>
    mutate({
      bio: data.bio,
      tagIds: selectedTagIds,
    }),
  )

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      const newTags = selectedTagIds.filter((selectedTagId) => tagId !== selectedTagId)
      setSelectedTagIds(newTags)
    } else {
      if (selectedTagIds.length === MAX_TAGS) return
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  return (
    <SafeAreaView>
      <View className="flex-1 px-4 pt-4">
        <FormProvider {...form}>
          <AvoidSoftInputView>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
              className="space-y-2"
            >
              <Heading className="text-2xl">Tell us a bit about youself</Heading>

              <View className="mb-4">
                <View className="flex flex-row justify-between">
                  <Text className="leading-6">Describe yourself</Text>
                  <Text className="opacity-70">
                    {selectedTagIds.length}/{MAX_TAGS}
                  </Text>
                </View>
                {isTagsLoading ? (
                  <Spinner />
                ) : (
                  <View className="flex flex-row flex-wrap gap-2">
                    {tags?.map((tag) => (
                      <Button
                        key={tag.id}
                        size="xs"
                        variant={selectedTagIds.includes(tag.id) ? "primary" : "outline"}
                        onPress={() => handleToggleTag(tag.id)}
                      >
                        {tag.name}
                      </Button>
                    ))}
                  </View>
                )}
              </View>

              <FormInput
                multiline
                className="h-[100px]"
                name="bio"
                placeholder="Sustainability, nature, and the outdoors are my passions. I love to ramble and meet new people."
                label="a few more words"
                error={error}
              />

              <View className="flex flex-row items-center justify-between">
                <View />
                <View className="flex flex-row items-center space-x-2">
                  <Link asChild href="/onboarding/2">
                    <Button variant="link">Skip</Button>
                  </Link>

                  <Button className="w-[120px]" isLoading={isLoading} onPress={onSubmit}>
                    Next
                  </Button>
                </View>
              </View>
            </ScrollView>
          </AvoidSoftInputView>
        </FormProvider>
      </View>
    </SafeAreaView>
  )
}
