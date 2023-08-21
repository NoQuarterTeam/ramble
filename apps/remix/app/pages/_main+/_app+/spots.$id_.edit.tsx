import { useLoaderData } from "@remix-run/react"
import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import { json, redirect } from "@vercel/remix"

import { generateBlurHash } from "@ramble/api"
import { canManageSpot } from "@ramble/shared"

import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { notFound } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

import { amenitiesSchema, SpotForm, spotSchema } from "./components/SpotForm"

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await getCurrentUser(request, { role: true, id: true, isAdmin: true, isVerified: true })
  const spot = await db.spot.findUniqueOrThrow({
    where: { id: params.id, deletedAt: { equals: null } },
    include: { images: true, amenities: true },
  })
  if (!canManageSpot(spot, user)) throw redirect("/spots")
  return json(spot)
}

export const action = async ({ request, params }: ActionArgs) => {
  const user = await getCurrentUser(request, { id: true, role: true, isAdmin: true, isVerified: true })
  const formData = await request.formData()

  const result = await validateFormData(formData, spotSchema)

  const images = (formData.getAll("image") as string[]).filter(Boolean)

  if (!result.success) return formError(result)

  const spot = await db.spot.findUnique({ where: { id: params.id }, include: { images: true, amenities: true } })
  if (!spot) throw notFound()
  if (!canManageSpot(spot, user)) throw redirect("/spots")

  let amenities
  if (result.data.type === "CAMPING") {
    const amenitiesResult = await validateFormData(formData, amenitiesSchema)
    if (!amenitiesResult.success) return formError(amenitiesResult)
    amenities = amenitiesResult.data
  }

  const imagesToDelete = spot.images.filter((image) => !images.includes(image.path))
  const imagesToCreate = images.filter((image) => !spot.images.find((i) => i.path === image))

  const imageData = await Promise.all(
    imagesToCreate.map(async (image) => {
      const blurHash = await generateBlurHash(image)
      return { path: image, blurHash, creator: { connect: { id: user.id } } }
    }),
  )

  const { customAddress, ...data } = result.data
  await db.spot.update({
    where: { id: spot.id },
    data: {
      ...data,
      address: customAddress || result.data.address,
      amenities:
        spot.type === "CAMPING" && result.data.type !== "CAMPING"
          ? { delete: true }
          : result.data.type === "CAMPING" && (spot.type !== "CAMPING" || !spot.amenities)
          ? { create: amenities }
          : spot.type === "CAMPING" && result.data.type === "CAMPING"
          ? { update: amenities }
          : undefined,
      images: { delete: imagesToDelete, create: imageData },
    },
  })

  return redirect(`/spots/${spot.id}`)
}

export default function EditSpot() {
  const spot = useLoaderData<typeof loader>()
  return <SpotForm spot={spot} />
}
