import { useLoaderData } from "@remix-run/react"

import { reviewDataSchema } from "@ramble/server-schemas"

import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form.server"
import { notFound, redirect } from "~/lib/remix.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { requireUser } from "~/services/auth/auth.server"

import { ReviewForm } from "./components/ReviewForm"

export const config = {
  // runtime: "edge",
  // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export enum NEW_REVIEW_REDIRECTS {
  Map = "map",
  Detail = "detail",
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireUser(request)

  const spot = await db.spot.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, images: { orderBy: { createdAt: "asc" }, take: 3 } },
  })
  if (!spot) throw notFound()
  return json(spot)
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUser(request)
  const url = new URL(request.url)
  const redirectVal = url.searchParams.get("redirect") as NEW_REVIEW_REDIRECTS
  const redirectLocation = redirectVal === NEW_REVIEW_REDIRECTS.Map ? "/map/" + params.id : "/spots/" + params.id

  const result = await validateFormData(request, reviewDataSchema)
  if (!result.success) return formError(result)
  const spot = await db.spot.findUnique({ where: { id: params.id } })
  if (!spot) throw notFound()

  const existingReviewsWithin1Month = await db.review.count({
    where: {
      spotId: spot.id,
      userId,
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
    },
  })

  if (existingReviewsWithin1Month > 0) return formError({ formError: "You can only review a spot once per month." })

  const review = await db.review.create({
    data: { description: result.data.description, rating: result.data.rating, spotId: spot.id, userId },
  })
  track("Review created", { reviewId: review.id, userId })

  return redirect(redirectLocation, request, { flash: { title: "Review created!", description: "Thank you!" } })
}

export default function NewReview() {
  const spot = useLoaderData<typeof loader>()

  return <ReviewForm spot={spot} />
}
