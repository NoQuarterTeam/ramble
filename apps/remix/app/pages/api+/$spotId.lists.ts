import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"

import { db } from "~/lib/db.server"
import { requireUser } from "~/services/auth/auth.server"

export const loader = async ({ request, params }: LoaderArgs) => {
  if (!params.spotId) return json([])
  const userId = await requireUser(request)
  const lists = await db.list.findMany({
    where: { creatorId: userId },
    select: { id: true, name: true, listSpots: { select: { spotId: true } } },
    orderBy: { createdAt: "desc" },
  })
  return json(lists)
}

export const spotListsLoader = loader
