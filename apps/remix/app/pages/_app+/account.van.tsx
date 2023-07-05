import * as React from "react"
import { type VanImage } from "@ramble/database/types"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { z } from "zod"

import { Form, FormButton, FormError, FormField, FormFieldLabel, ImageField } from "~/components/Form"
import { IconButton, Textarea } from "~/components/ui"
import { db } from "~/lib/db.server"
import { formError, FormNumber, NullableFormString, validateFormData } from "~/lib/form"
import { redirect } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"
import { ImageUploader } from "~/components/ImageUploader"
import { Plus } from "lucide-react"
import { raise } from "~/lib/helpers/utils"

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
  })
  const formData = await request.formData()
  const result = await validateFormData(formData, schema)
  if (!result.success) return formError(result)
  const images = (formData.getAll("image") as string[]).filter(Boolean)
  const data = result.data
  if (user.van) {
    await db.van.update({
      where: { id: user.van.id },
      data: {
        userId: user.id,
        ...data,
        images: {
          deleteMany: { path: { notIn: images } },
          connectOrCreate: images.map((image) => ({
            where: { vanId_path: { path: image, vanId: user.van?.id ?? raise("id required") } },
            create: { path: image },
          })),
        },
      },
    })
  } else {
    await db.van.create({
      data: {
        userId: user.id,
        ...data,
        images: { createMany: { data: images.map((image) => ({ path: image })) } },
      },
    })
  }

  return redirect("/account/van", request, { flash: { title: user.van ? "Van updated" : "Van created" } })
}

export default function VanAccount() {
  const user = useLoaderData<typeof loader>()
  const [images, setImages] = React.useState<Pick<VanImage, "path">[]>(user.van?.images || [])
  return (
    <Form className="space-y-4">
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

        <div className="space-y-0.5">
          <FormFieldLabel>Have some images you want to share?</FormFieldLabel>
          <div className="flex flex-wrap gap-2">
            {images.map(({ path }) => (
              <ImageField
                className="sq-28 overflow-hidden rounded"
                onRemove={() => setImages(images.filter((image) => image.path !== path))}
                defaultValue={path}
                key={path}
                name="image"
              />
            ))}

            <ImageUploader
              className="sq-28"
              isMulti
              onMultiSubmit={(keys) => setImages((i) => [...i, ...keys.map((k) => ({ path: k }))])}
            >
              <IconButton className="sq-full" variant="outline" icon={<Plus className="sq-4" />} aria-label="Add image" />
            </ImageUploader>
          </div>
        </div>
      </div>

      <FormButton>{user.van ? "Update" : "Create"}</FormButton>
    </Form>
  )
}
