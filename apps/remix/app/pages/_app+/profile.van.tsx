import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { Textarea } from "@ramble/ui"
import { Form, FormButton, FormError, FormField, ImageField } from "~/components/Form"
import { getCurrentUser } from "~/services/auth/auth.server"
import { redirect } from "~/lib/remix.server"
import { FlashType } from "~/services/session/flash.server"
import { db } from "~/lib/db.server"
import { formError, FormNumber, NullableFormString, validateFormData } from "~/lib/form"
import { z } from "zod"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, {
    van: {
      select: { id: true, model: true, description: true, year: true, name: true, images: { select: { path: true, id: true } } },
    },
  })
  return json(user)
}

export const action = async ({ request }: ActionArgs) => {
  const user = await getCurrentUser(request, { id: true, van: { select: { id: true } } })
  const schema = z.object({
    name: z.string().min(1),
    model: z.string().min(1),
    year: FormNumber.min(1950).max(new Date().getFullYear() + 2),
    description: NullableFormString,
    image: NullableFormString,
  })
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const { image, ...data } = result.data
  if (user.van) {
    await db.van.update({
      where: { id: user.van.id },
      data: { userId: user.id, ...data, images: image ? { create: { path: image } } : undefined },
    })
  } else {
    await db.van.create({ data: { userId: user.id, ...data, images: image ? { create: { path: image } } : undefined } })
  }

  return redirect("/profile/van", request, { flash: { type: FlashType.Info, title: user.van ? "Van updated" : "Van created" } })
}

export default function VanProfile() {
  const user = useLoaderData<typeof loader>()

  return (
    <Form method="post" replace className="space-y-4">
      <h1 className="text-3xl">My van</h1>
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

        <ImageField
          name="image"
          defaultValue={user.van?.images?.[0]?.path}
          label="Have an image you want to share?"
          placeholder="Click or drop an image here"
        />
      </div>

      <FormButton>{user.van ? "Update" : "Create"}</FormButton>
    </Form>
  )
}
