import { useLoaderData } from "@remix-run/react"
import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import { json, redirect } from "@vercel/remix"

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
    include: { images: true },
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

  const { customAddress, ...data } = result.data

  const spot = await db.spot.findUnique({ where: { id: params.id } })
  if (!spot) throw notFound(null)

  if (!canManageSpot(spot, user)) throw redirect("/latest")
  await db.spot.update({
    where: { id: spot.id },
    data: {
      ...data,
      images: {
        deleteMany: { path: { notIn: images } },
        connectOrCreate: images.map((image) => ({
          where: { spotId_path: { path: image, spotId: spot.id } },
          create: { path: image, creator: { connect: { id: user.id } } },
        })),
      },
      address: customAddress ?? data.address,
    },
  })

  return redirect(`/spots/${spot.id}`)
}

export default function EditSpot() {
  const spot = useLoaderData<typeof loader>()
  return <SpotForm spot={spot} />
}
