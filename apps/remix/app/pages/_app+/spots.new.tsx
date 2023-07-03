import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import { json, redirect } from "@vercel/remix"

import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

import { SpotForm, spotSchema } from "./components/SpotForm"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request)
  return json(null)
}

export const action = async ({ request }: ActionArgs) => {
  const { id, role } = await getCurrentUser(request)
  const formData = await request.formData()

  const result = await validateFormData(formData, spotSchema)

  const images = (formData.getAll("image") as string[]).filter(Boolean)

  if (!result.success) return formError(result)

  const { customAddress, ...data } = result.data
  const spot = await db.spot.create({
    data: {
      creator: { connect: { id } },
      verifiedAt: role === "AMBASSADOR" || role === "ADMIN" ? new Date() : undefined,
      verifier: role === "AMBASSADOR" || role === "ADMIN" ? { connect: { id } } : undefined,
      ...data,
      images: { create: images.map((image) => ({ path: image, creator: { connect: { id } } })) },
      address: customAddress ?? data.address,
    },
  })

  return redirect(`/spots/${spot.id}`)
}

export default function NewSpot() {
  return <SpotForm />
}
