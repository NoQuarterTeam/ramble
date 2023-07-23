import { useLoaderData } from "@remix-run/react"
import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import { json, redirect } from "@vercel/remix"

import { generateBlurHash } from "@ramble/api"

import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { notFound } from "~/lib/remix.server"
import { canManageSpot } from "~/lib/spots"
import { getCurrentUser } from "~/services/auth/auth.server"

import { SpotForm, spotSchema } from "./components/SpotForm"

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await getCurrentUser(request, { role: true, id: true })
  const spot = await db.spot.findUniqueOrThrow({
    where: { id: params.id },
    include: { images: true, amenities: true },
  })
  if (!canManageSpot(spot, user)) throw redirect("/latest")
  return json(spot)
}

export const action = async ({ request, params }: ActionArgs) => {
  const user = await getCurrentUser(request, { id: true, role: true })
  const formData = await request.formData()

  const result = await validateFormData(formData, spotSchema)

  const images = (formData.getAll("image") as string[]).filter(Boolean)

  if (!result.success) return formError(result)

  const { customAddress, latitude, longitude, name, address, type, description, ...amenities } = result.data

  const spot = await db.spot.findUnique({ where: { id: params.id }, include: { images: true, amenities: true } })
  if (!spot) throw notFound(null)
  if (!canManageSpot(spot, user)) throw redirect("/latest")

  const imagesToDelete = spot.images.filter((image) => !images.includes(image.path))
  const imagesToCreate = images.filter((image) => !spot.images.find((i) => i.path === image))

  const imageData = await Promise.all(
    imagesToCreate.map(async (image) => {
      const blurHash = await generateBlurHash(image)
      return { path: image, blurHash, creator: { connect: { id: user.id } } }
    }),
  )
  await db.spot.update({
    where: { id: spot.id },
    data: {
      latitude,
      longitude,
      name,
      type,
      description,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore -- when camping these will be true or false
      amenities:
        spot.type === "CAMPING" && type !== "CAMPING"
          ? { delete: true }
          : spot.type !== "CAMPING" && type === "CAMPING"
          ? { create: amenities }
          : spot.type === "CAMPING" && type === "CAMPING"
          ? { update: amenities }
          : undefined,
      images: { delete: imagesToDelete, create: imageData },
      address: customAddress ?? address,
    },
  })

  return redirect(`/spots/${spot.id}`)
}

export default function EditSpot() {
  const spot = useLoaderData<typeof loader>()
  return <SpotForm spot={spot} />
}
