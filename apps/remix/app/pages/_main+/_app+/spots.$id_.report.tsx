import { useLoaderData } from "@remix-run/react"
import { z } from "zod"

import { NullableFormString, spotAmenitiesSchema, spotRevisionSchema } from "@ramble/server-schemas"
import { publicSpotWhereClause } from "@ramble/server-services"
import { canManageSpot, doesSpotTypeRequireAmenities } from "@ramble/shared"

import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form.server"
import { notFound, redirect } from "~/lib/remix.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { getCurrentUser } from "~/services/auth/auth.server"

import { SpotReportForm } from "./components/SpotReportForm"

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

  const formData = await request.formData()
  const flaggedImageIds = formData.getAll("flaggedImageId")

  const { customAddress, ...data } = result.data
  const notes = {
    name: data.name,
    description: data.description,
    isLocationUnknown: data.isLocationUnknown,
    address: data.address || customAddress,
    latitude: data.latitude,
    longitude: data.longitude,
    // isPetFriendly: data.isPetFriendly,
    type: data.type,
    amenities,
    flaggedImageIds: flaggedImageIds.join(", "),
    notes: data.notes,
  }

  await db.spotRevision.create({ data: { notes, spotId: spot.id, creatorId: user.id } })

  track("Spot report created", { spotId: spot.id, userId: user.id })

  return redirect(`/spots/${spot.id}`, request, {
    flash: { title: "Report submitted", description: "Your report has been submitted. Thank you for making Ramble even better!" },
  })
}

export default function ReportSpot() {
  const spot = useLoaderData<typeof loader>()
  return <SpotReportForm spot={spot} />
}
