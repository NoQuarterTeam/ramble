import dayjs from "dayjs"
import { z } from "zod"

import { NullableFormString, spotAmenitiesSchema, spotSchema } from "@ramble/server-schemas"
import { generateBlurHash } from "@ramble/server-services"
import { doesSpotTypeRequireAmenities } from "@ramble/shared"

import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form.server"
import { json, redirect } from "~/lib/remix.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { getCurrentUser } from "~/services/auth/auth.server"

import { SpotForm } from "./components/SpotForm"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, { isVerified: true })
  if (!user.isVerified) return redirect("/account", request, { flash: { title: "Account not verified" } })
  return json(null)
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request)
  if (!user.isVerified) return redirect("/account", request, { flash: { title: "Account not verified" } })

  const result = await validateFormData(request, spotSchema.and(z.object({ customAddress: NullableFormString })))
  if (!result.success) return formError(result)

  let amenities: undefined | z.infer<typeof spotAmenitiesSchema>
  if (doesSpotTypeRequireAmenities(result.data.type)) {
    const amenitiesResult = await validateFormData(request, spotAmenitiesSchema)
    if (!amenitiesResult.success) return formError(amenitiesResult)
    amenities = amenitiesResult.data
  }
  const formData = await request.clone().formData()
  const images = (formData.getAll("image") as string[]).filter(Boolean)
  const shouldPublishLater = formData.get("shouldPublishLater") === "on"
  const { customAddress, ...data } = result.data
  const imageData = await Promise.all(
    images.map(async (image) => {
      const blurHash = await generateBlurHash(image)
      return { path: image, blurHash, creator: { connect: { id: user.id } } }
    }),
  )

  const spot = await db.spot.create({
    data: {
      ...data,
      publishedAt: shouldPublishLater ? dayjs().add(2, "weeks").toDate() : undefined,
      address: customAddress || result.data.address,
      creator: { connect: { id: user.id } },
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
