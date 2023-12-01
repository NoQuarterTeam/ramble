import { useLoaderData } from "@remix-run/react"

import { NullableFormString, spotAmenitiesSchema, spotRevisionSchema } from "@ramble/server-schemas"
import { publicSpotWhereClause } from "@ramble/server-services"
import { canManageSpot, doesSpotTypeRequireAmenities } from "@ramble/shared"
import { z } from "zod"

import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form.server"
import { notFound } from "~/lib/remix.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json, redirect } from "~/lib/vendor/vercel.server"
import { getCurrentUser } from "~/services/auth/auth.server"
import { SpotReportForm } from "./components/SpotReportForm"
import { track } from "~/lib/analytics.server"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, { role: true, id: true, isAdmin: true, isVerified: true })
  const spot = await db.spot.findUniqueOrThrow({
    where: { id: params.id, ...publicSpotWhereClause(user.id) },
    include: { images: true, amenities: true },
  })
  if (!canManageSpot(spot, user)) throw redirect("/spots")
  return json(spot)
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request, { id: true, role: true, isAdmin: true, isVerified: true })
  const result = await validateFormData(request, spotRevisionSchema.and(z.object({ customAddress: NullableFormString })))
  if (!result.success) return formError(result)
  const spot = await db.spot.findUnique({ where: { id: params.id }, include: { images: true, amenities: true } })
  if (!spot) throw notFound()

  let amenities: undefined | z.infer<typeof spotAmenitiesSchema>
  if (doesSpotTypeRequireAmenities(result.data.type)) {
    const amenitiesResult = await validateFormData(request, spotAmenitiesSchema)
    if (!amenitiesResult.success) return formError(amenitiesResult)
    amenities = amenitiesResult.data
  }

  const { customAddress, ...data } = result.data
  const notes = {
    name: data.name,
    description: data.description,
    address: customAddress || data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    isPetFriendly: data.isPetFriendly,
    type: data.type,
    amenities: amenities
      ? { update: spot.amenities ? amenities : undefined, create: spot.amenities ? undefined : amenities }
      : { delete: spot.amenities ? true : undefined },
    notes: data.notes,
  }

  await db.spotRevision.create({ data: { notes, spotId: spot.id, creatorId: user.id } })

  // const images = (formData.getAll("image") as string[]).filter(Boolean)
  // const imagesToDelete = spot.images.filter((image) => !images.includes(image.path))
  // const imagesToCreate = images.filter((image) => !spot.images.find((i) => i.path === image))

  // const imageData = await Promise.all(
  //   imagesToCreate.map(async (image) => {
  //     const blurHash = await generateBlurHash(image)
  //     return { path: image, blurHash, creator: { connect: { id: user.id } } }
  //   }),
  // )

  track("Spot report created", { spotId: spot.id, userId: user.id })

  // TODO get toast to work
  // toast.success("Report submitted", { description: "Your report has been submitted. Thank you for making Ramble even better!" })
  return redirect(`/spots/${spot.id}`)
  return null
}

export default function ReportSpot() {
  const spot = useLoaderData<typeof loader>()
  return <SpotReportForm spot={spot} />
}
