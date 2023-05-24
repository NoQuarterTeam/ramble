import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { z } from "zod"
import { db } from "~/lib/db.server"
import { FormNumber, formError, validateFormData } from "~/lib/form"
import { notFound, redirect } from "~/lib/remix.server"
import { requireUser } from "~/services/auth/auth.server"
import { ReviewForm } from "./components/ReviewForm"

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUser(request)

  const spot = await db.spot.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, images: { orderBy: { createdAt: "asc" }, take: 3 } },
  })
  if (!spot) throw notFound(null)
  return json(spot)
}

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireUser(request)
  const schema = z.object({
    description: z.string().min(10),
    rating: FormNumber.min(1).max(5),
  })
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const spot = await db.spot.findUnique({ where: { id: params.id } })
  if (!spot) throw notFound(null)

  const existingReviewsWithin1Month = await db.review.count({
    where: {
      spotId: spot.id,
      userId,
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
    },
  })

  if (existingReviewsWithin1Month > 0) return formError({ formError: "You can only review a spot once per month." })

  await db.review.create({
    data: { description: result.data.description, rating: result.data.rating, spotId: spot.id, userId },
  })
  return redirect("/spots/" + spot.id, request, { flash: { title: "Review created!", description: "Thank you!" } })
}

export default function NewReview() {
  const spot = useLoaderData<typeof loader>()

  return <ReviewForm spot={spot} />
}
