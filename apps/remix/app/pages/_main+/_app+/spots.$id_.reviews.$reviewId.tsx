import { useLoaderData } from "@remix-run/react"
import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { z } from "zod"

import { db } from "~/lib/db.server"
import { formError, FormNumber, validateFormData } from "~/lib/form"
import { badRequest, notFound, redirect } from "~/lib/remix.server"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

import { ReviewForm } from "./components/ReviewForm"

export const loader = async ({ request, params }: LoaderArgs) => {
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
  Edit = "Edit",
  Delete = "Delete",
}

export const action = async ({ request, params }: ActionArgs) => {
  const user = await getCurrentUser(request)
  const formData = await request.formData()
  const action = formData.get("_action") as Actions | undefined

  switch (action) {
    case Actions.Edit:
      try {
        const schema = z.object({ description: z.string().min(10), rating: FormNumber.min(1).max(5) })
        const result = await validateFormData(formData, schema)
        if (!result.success) return formError(result)
        const spot = await db.spot.findUnique({ where: { id: params.id } })
        if (!spot) throw notFound()

        const review = await db.review.findUnique({ where: { id: params.reviewId } })
        if (!review || review.userId !== user.id) throw notFound()

        await db.review.update({
          where: { id: review.id },
          data: { description: result.data.description, rating: result.data.rating },
        })
        return redirect("/spots/" + spot.id, request, { flash: { title: "Review updated!", description: "Thank you!" } })
      } catch {
        return badRequest(null, request, { flash: { title: "Error editing review" } })
      }
    case Actions.Delete:
      try {
        const review = await db.review.findUnique({ where: { id: params.reviewId } })
        if (!review || review.userId !== user.id) throw notFound()
        await db.review.delete({ where: { id: review.id } })

        return redirect("/spots/" + params.id, request, { flash: { title: "Review deleted" } })
      } catch {
        return badRequest(null, request, { flash: { title: "Error deleting review" } })
      }
  }
}

export default function NewReview() {
  const { spot, review } = useLoaderData<typeof loader>()

  return <ReviewForm spot={spot} review={review} />
}
