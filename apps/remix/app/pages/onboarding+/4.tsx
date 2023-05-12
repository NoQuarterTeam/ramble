import type { ActionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json, redirect } from "@vercel/remix"
import { z } from "zod"

import { Textarea } from "@ramble/ui"

import { Form, FormButton, FormError, FormField, ImageField } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { db } from "~/lib/db.server"
import { formError, FormNumber, NullableFormString, validateFormData } from "~/lib/form"
import { getCurrentUser } from "~/services/auth/auth.server"

import Footer from "./components/Footer"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, {
    id: true,
    van: { select: { name: true, description: true, model: true, year: true, images: { take: 1, select: { path: true } } } },
  })
  return json(user)
}

const schema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  year: FormNumber.min(1950).max(new Date().getFullYear() + 2),
  description: NullableFormString,
  image: NullableFormString,
})

export const action = async ({ request }: ActionArgs) => {
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const user = await getCurrentUser(request, { id: true, van: { select: { id: true } } })
  const { image, ...data } = result.data
  if (user.van) {
    await db.van.update({
      where: { id: user.van.id },
      data: { userId: user.id, ...data, images: image ? { create: { path: image } } : undefined },
    })
  } else {
    await db.van.create({ data: { userId: user.id, ...data, images: image ? { create: { path: image } } : undefined } })
  }

  return redirect("/map/welcome")
}

export default function Onboarding3() {
  const user = useLoaderData<typeof loader>()
  return (
    <Form method="post" replace className="space-y-10">
      <div>
        <h1 className="text-3xl">Tell us a little bit about your van setup?</h1>
        <p className="opacity-70">What you repping</p>
      </div>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="space-y-2">
          <FormField required name="name" defaultValue={user.van?.name} label="What's it's name?" placeholder="Patrick" />
          <FormField
            required
            name="model"
            defaultValue={user.van?.model}
            label="What type of van is it?"
            placeholder="Citroën Jumper"
          />
          <FormField
            required
            name="year"
            defaultValue={String(user.van?.year || "")}
            label="What year was it born?"
            placeholder="2013"
          />
          <FormField
            name="description"
            defaultValue={user.van?.description || ""}
            label="Anything else you wana mention?"
            input={<Textarea rows={4} />}
          />
          <FormError />
        </div>
        <div>
          <ImageField
            name="image"
            defaultValue={user.van?.images?.[0]?.path}
            label="Have an image you want to share?"
            placeholder="Click or drop an image here"
          />
        </div>
      </div>
      <Footer>
        <LinkButton size="lg" to="../3" variant="ghost">
          Back
        </LinkButton>
        <div className="flex space-x-2">
          <LinkButton size="lg" to="/map/welcome" variant="ghost">
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
