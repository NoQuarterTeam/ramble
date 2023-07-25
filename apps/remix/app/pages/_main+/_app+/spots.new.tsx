import type { ActionArgs, LoaderArgs } from "@vercel/remix"

import { generateBlurHash } from "@ramble/api"

import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { json, redirect } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

import { SpotForm, spotSchema } from "./components/SpotForm"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, { isVerified: true })
  if (!user.isVerified) return redirect("/account", request, { flash: { title: "Account not verified" } })
  return json(null)
}

export const action = async ({ request }: ActionArgs) => {
  const { id, role, isVerified } = await getCurrentUser(request)
  if (!isVerified) return redirect("/account", request, { flash: { title: "Account not verified" } })
  const formData = await request.formData()

  const result = await validateFormData(formData, spotSchema)

  const images = (formData.getAll("image") as string[]).filter(Boolean)

  if (!result.success) return formError(result)

  const imageData = await Promise.all(
    images.map(async (image) => {
      const blurHash = await generateBlurHash(image)
      return { path: image, blurHash, creator: { connect: { id } } }
    }),
  )

  const { customAddress, latitude, longitude, name, address, type, description, ...amenities } = result.data
  const spot = await db.spot.create({
    data: {
      creator: { connect: { id } },
      verifiedAt: role === "GUIDE" ? new Date() : undefined,
      verifier: role === "GUIDE" ? { connect: { id } } : undefined,
      latitude,
      longitude,
      name,
      type,
      description,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore -- when camping these will be true or false
      amenities: type === "CAMPING" ? { create: amenities } : undefined,
      images: { create: imageData },
      address: customAddress ?? address,
    },
  })

  return redirect(`/spots/${spot.id}`)
}

export default function NewSpot() {
  return <SpotForm />
}
