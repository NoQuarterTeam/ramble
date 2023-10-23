import { useLoaderData } from "@remix-run/react"
import { z } from "zod"

import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { createAction, createActions, FormNumber } from "~/lib/form.server"
import { badRequest, notFound, redirect } from "~/lib/remix.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

import { ReviewForm } from "./components/ReviewForm"

export const config = {
  // runtime: "edge",
  // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireUser(request)

  const spot = await db.spot.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, images: { orderBy: { createdAt: "asc" }, take: 3 } },
  })
  if (!spot) throw notFound()
  const review = await db.review.findUnique({ where: { id: params.reviewId } })

  if (!review || review.userId !== userId) throw notFound()
  return json({ spot, review })
}

export enum Actions {
  Edit = "edit",
  Delete = "delete",
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request)
  return createActions<Actions>(request, {
    edit: () =>
      createAction(request)
        .input(z.object({ description: z.string().min(10), rating: FormNumber.min(1).max(5) }))
        .handler(async (data) => {
          try {
            const spot = await db.spot.findUnique({ where: { id: params.id } })
            if (!spot) throw notFound()
            const review = await db.review.findUnique({ where: { id: params.reviewId } })
            if (!review || review.userId !== user.id) throw notFound()
            await db.review.update({
              where: { id: review.id },
              data: { description: data.description, rating: data.rating },
            })
            track("Review updated", { reviewId: review.id, userId: user.id })
            return redirect("/spots/" + spot.id, request, { flash: { title: "Review updated!", description: "Thank you!" } })
          } catch {
            return badRequest(null, request, { flash: { title: "Error editing review" } })
          }
        }),
    delete: () =>
      createAction(request).handler(async () => {
        const review = await db.review.findUnique({ where: { id: params.reviewId } })
        if (!review || review.userId !== user.id) throw notFound()
        await db.review.delete({ where: { id: review.id } })
        return redirect("/spots/" + params.id, request, { flash: { title: "Review deleted" } })
      }),
  })
}

export default function NewReview() {
  const { spot, review } = useLoaderData<typeof loader>()

  return <ReviewForm spot={spot} review={review} />
}
