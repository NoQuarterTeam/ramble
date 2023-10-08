import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix"
import dayjs from "dayjs"
import type { z } from "zod"

import { generateBlurHash } from "@ramble/api"
import { doesSpotTypeRequireAmenities } from "@ramble/shared"

import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { json, redirect } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

import { amenitiesSchema, SpotForm, spotSchema } from "./components/SpotForm"
import { track } from "@vercel/analytics/server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, { isVerified: true })
  if (!user.isVerified) return redirect("/account", request, { flash: { title: "Account not verified" } })
  return json(null)
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request)
  if (!user.isVerified) return redirect("/account", request, { flash: { title: "Account not verified" } })

  const result = await validateFormData(request, spotSchema)
  if (!result.success) return formError(result)

  const formData = await request.formData()
  const images = (formData.getAll("image") as string[]).filter(Boolean)
  const shouldPublishLater = formData.get("shouldPublishLater") === "on"
  const { customAddress, ...data } = result.data
  const imageData = await Promise.all(
    images.map(async (image) => {
      const blurHash = await generateBlurHash(image)
      return { path: image, blurHash, creator: { connect: { id: user.id } } }
    }),
  )

  let amenities: undefined | z.infer<typeof amenitiesSchema>
  if (doesSpotTypeRequireAmenities(result.data.type)) {
    const amenitiesResult = await validateFormData(request, amenitiesSchema)
    if (!amenitiesResult.success) return formError(amenitiesResult)
    amenities = amenitiesResult.data
  }

  const spot = await db.spot.create({
    data: {
      ...data,
      publishedAt: shouldPublishLater ? dayjs().add(2, "weeks").toDate() : undefined,
      address: customAddress || result.data.address,
      creator: { connect: { id: user.id } },
      verifiedAt: user.role === "GUIDE" ? new Date() : undefined,
      verifier: user.role === "GUIDE" ? { connect: { id: user.id } } : undefined,
      amenities: amenities ? { create: amenities } : undefined,
      images: { create: imageData },
    },
  })

  track("Spot created", { spotId: spot.id, userId: user.id })

  return redirect(`/spots/${spot.id}`)
}

export default function NewSpot() {
  return <SpotForm />
}
