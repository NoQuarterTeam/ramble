import { ScrollView, View } from "react-native"
import { Heading } from "../../components/ui/Heading"

import { FormInput } from "../../components/ui/FormInput"
import { FormProvider } from "react-hook-form"
import { api } from "../../lib/api"
import { useMe } from "../../lib/hooks/useMe"
import { useForm } from "../../lib/hooks/useForm"
import { toast } from "../../components/ui/Toast"
import { Button } from "../../components/ui/Button"

export default function OnboardingStep1Screen() {
  const { me } = useMe()
  const form = useForm({
    defaultValues: {
      bio: me?.bio || "",
      firstName: me?.firstName || "",
      lastName: me?.lastName || "",
      email: me?.email || "",
      username: me?.username || "",
    },
  })

  const utils = api.useContext()
  const { mutate, isLoading, error } = api.user.update.useMutation({
    onSuccess: (data) => {
      utils.user.me.setData(undefined, data)
      toast({ title: "Account updated." })
    },
  })

  const onSubmit = form.handleSubmit((data) => mutate(data))
  return (
    <FormProvider {...form}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-20">
          <Heading className="mb-4 text-2xl">Tell us a little bit youself</Heading>
          <FormInput
            multiline
            className="h-[100px]"
            name="bio"
            placeholder="Sustainability, nature, and the outdoors are my passions. I love to ramble and meet new people."
            label="A little bio, just a few words about yourself and your interests"
            error={error}
          />
        </View>
      </ScrollView>
      <View className="absolute bottom-10 left-0 right-0 flex flex-row items-center justify-between px-4">
        <Button variant="link">Skip</Button>
        <Button isLoading={isLoading} onPress={onSubmit}>
          Next
        </Button>
      </View>
    </FormProvider>
  )
}
