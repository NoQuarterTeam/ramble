import * as React from "react"
import { useLoaderData } from "@remix-run/react"
import { Plus } from "lucide-react"

import { generateBlurHash } from "@ramble/api"
import { type VanImage } from "@ramble/database/types"

import { Form, FormButton, FormError, FormField, FormFieldLabel, ImageField } from "~/components/Form"
import { ImageUploader } from "~/components/ImageUploader"
import { LinkButton } from "~/components/LinkButton"
import { IconButton, Textarea } from "~/components/ui"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, FormNumber, NullableFormString, validateFormData } from "~/lib/form.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json, redirect } from "~/lib/vendor/vercel.server"
import { z } from "~/lib/vendor/zod.server"
import { getCurrentUser } from "~/services/auth/auth.server"

import { Footer } from "./components/Footer"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, {
    id: true,
    van: { select: { name: true, description: true, model: true, year: true, images: { select: { path: true } } } },
  })
  return json(user)
}

const schema = z.object({
  name: z.string().min(1),
  model: z.string().min(1),
  year: FormNumber.min(1950).max(new Date().getFullYear() + 2),
  description: NullableFormString,
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const user = await getCurrentUser(request, { id: true, van: { select: { id: true } } })

  const formData = await request.formData()
  const images = (formData.getAll("image") as string[]).filter(Boolean)
  const data = result.data
  if (user.van) {
    const van = await db.van.findUniqueOrThrow({ where: { id: user.van.id }, include: { images: true } })
    const imagesToDelete = van.images.filter((image) => !images.includes(image.path))
    const imagesToCreate = images.filter((image) => !van.images.find((i) => i.path === image))
    const imageData = await Promise.all(
      imagesToCreate.map(async (image) => {
        const blurHash = await generateBlurHash(image)
        return { path: image, blurHash }
      }),
    )
    await db.van.update({
      where: { id: user.van.id },
      data: { userId: user.id, ...data, images: { delete: imagesToDelete, create: imageData } },
    })
  } else {
    const imageData = await Promise.all(
      images.map(async (image) => {
        const blurHash = await generateBlurHash(image)
        return { path: image, blurHash }
      }),
    )
    await db.van.create({ data: { userId: user.id, ...data, images: { create: imageData } } })
  }
  track("Onboarding 4 submitted", { userId: user.id })
  return redirect("/map/welcome")
}

export default function Onboarding4() {
  const user = useLoaderData<typeof loader>()
  const [images, setImages] = React.useState<Pick<VanImage, "path">[]>(user.van?.images || [])
  return (
    <Form className="space-y-10">
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
          <div className="space-y-0.5">
            <FormFieldLabel>Have some images you want to share?</FormFieldLabel>
            <div className="flex flex-wrap gap-2">
              {images.map(({ path }) => (
                <ImageField
                  className="sq-32 overflow-hidden rounded"
                  onRemove={() => setImages(images.filter((image) => image.path !== path))}
                  defaultValue={path}
                  key={path}
                  name="image"
                />
              ))}

              <ImageUploader
                className="sq-32"
                isMulti
                onMultiSubmit={(keys) => setImages((i) => [...i, ...keys.map((k) => ({ path: k }))])}
              >
                <IconButton className="sq-full" variant="outline" icon={<Plus className="sq-4" />} aria-label="Add image" />
              </ImageUploader>
            </div>
          </div>
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
