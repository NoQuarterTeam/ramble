import { useLoaderData } from "@remix-run/react"

import { userSchema } from "@ramble/server-schemas"
import { generateBlurHash } from "@ramble/server-services"

import { Form, FormButton, FormError, FormField, FormFieldLabel, ImageField } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { Textarea } from "~/components/ui"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json, redirect } from "~/lib/vendor/vercel.server"
import { getCurrentUser } from "~/services/auth/auth.server"

import { Footer } from "./components/Footer"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, { id: true, bio: true, avatar: true })
  return json(user)
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validateFormData(request, userSchema.pick({ bio: true, avatar: true }))
  if (!result.success) return formError(result)
  const user = await getCurrentUser(request, { id: true, avatar: true, avatarBlurHash: true })
  let avatarBlurHash = user.avatarBlurHash
  if (result.data.avatar && result.data.avatar !== user.avatar) {
    avatarBlurHash = await generateBlurHash(result.data.avatar)
  }
  await db.user.update({ where: { id: user.id }, data: { ...result.data, avatarBlurHash } })
  track("Onboarding 1 submitted", { userId: user.id })
  return redirect("/onboarding/2")
}

export default function Onboarding() {
  const user = useLoaderData<typeof loader>()
  return (
    <Form className="space-y-10">
      <div>
        <h1 className="text-3xl">Tell us a little bit youself</h1>
        <p className="opacity-70">Why do you ramble?</p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <FormField
          name="bio"
          defaultValue={user.bio || ""}
          placeholder="Sustainability, nature, and the outdoors are my passions. I love to ramble and meet new people."
          label="A little bio, just a few words about yourself and your interests"
          input={<Textarea rows={8} />}
        />
        <div className="flex w-full flex-col items-center text-center">
          <FormFieldLabel>Let's put a picture to your name</FormFieldLabel>
          <ImageField
            name="avatar"
            className="sq-[200px] rounded-xs border"
            defaultValue={user.avatar}
            placeholder="Click here"
          />
        </div>
      </div>
      <FormError />
      <Footer>
        <div />
        <div className="flex space-x-2">
          <LinkButton variant="ghost" to="2" size="lg" className="min-w-[100px]">
            Skip
          </LinkButton>
          <FormButton size="lg" className="min-w-[100px]">
            Next
          </FormButton>
        </div>
      </Footer>
    </Form>
  )
}
