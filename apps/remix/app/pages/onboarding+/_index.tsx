import type { ActionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json, redirect } from "@vercel/remix"
import { z } from "zod"

import { Textarea } from "@travel/ui"

import { Form, FormButton, FormField, FormFieldLabel, ImageField } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

import Footer from "./components/Footer"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, { id: true, bio: true, avatar: true })
  return json(user)
}

const schema = z.object({
  bio: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
})

export const action = async ({ request }: ActionArgs) => {
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const id = await requireUser(request)
  await db.user.update({ where: { id }, data: result.data })
  console.log("woooo")

  return redirect("/onboarding/2")
}

export default function Onboarding3() {
  const user = useLoaderData<typeof loader>()
  return (
    <Form method="post" replace className="space-y-10">
      <div>
        <h1 className="text-3xl">Tell us a little bit youself</h1>
        <p className="opacity-70">Why do you travel?</p>
      </div>
      {/* <div className="flex space-x-20"> */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <FormField
          name="bio"
          defaultValue={user.bio || ""}
          placeholder="Sustainability, nature, and the outdoors are my passions. I love to travel and meet new people."
          label="A little bio, just a few words about yourself and your interests"
          input={<Textarea rows={10} />}
        />
        <div className="flex w-full flex-col items-center text-center">
          <FormFieldLabel>Let&apos;s put a picture to your name</FormFieldLabel>
          <ImageField name="avatar" className="sq-[200px]" defaultValue={user.avatar} placeholder="Click here" path={user.id} />
        </div>
      </div>
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
