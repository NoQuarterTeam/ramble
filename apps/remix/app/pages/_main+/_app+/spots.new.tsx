import type { ActionArgs, LoaderArgs } from "@vercel/remix"

import { generateBlurHash } from "@ramble/api"

import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { json, redirect } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

import { amenitiesSchema, SpotForm, spotSchema } from "./components/SpotForm"

export const config = {
  runtime: "edge",
  regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

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

  const { customAddress, ...data } = result.data
  const imageData = await Promise.all(
    images.map(async (image) => {
      const blurHash = await generateBlurHash(image)
      return { path: image, blurHash, creator: { connect: { id } } }
    }),
  )

  let amenities
  if (result.data.type === "CAMPING") {
    const amenitiesResult = await validateFormData(formData, amenitiesSchema)
    if (!amenitiesResult.success) return formError(amenitiesResult)
    amenities = amenitiesResult.data
  }

  const spot = await db.spot.create({
    data: {
      ...data,
      address: customAddress || result.data.address,
      creator: { connect: { id } },
      verifiedAt: role === "GUIDE" ? new Date() : undefined,
      verifier: role === "GUIDE" ? { connect: { id } } : undefined,
      amenities: amenities ? { create: amenities } : undefined,
      images: { create: imageData },
    },
  })

  return redirect(`/spots/${spot.id}`)
}

export default function NewSpot() {
  return <SpotForm />
}
