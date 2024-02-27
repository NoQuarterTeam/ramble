import { track } from "@vercel/analytics/server"
import { z } from "zod"
import { zx } from "zodix"

import { listSchema } from "@ramble/server-schemas"

import { db } from "~/lib/db.server"
import { createAction, createActions } from "~/lib/form.server"
import { badRequest, json } from "~/lib/remix.server"
import { type ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { type Actions } from "~/pages/api+/spots+/$id.save-to-list"

import { requireUser } from "../auth/auth.server"

export type CreateListSchema = typeof listSchema

export const saveToListActions = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUser(request)
  const spotId = params.id as string
  return createActions<Actions>(request, {
    "toggle-save": () =>
      createAction(request)
        .input(z.object({ shouldSave: zx.BoolAsString, listId: z.string().uuid() }))
        .handler(async ({ shouldSave, listId }) => {
          if (!spotId) return badRequest("Missing spotId")
          await db.list.findFirstOrThrow({ select: { id: true }, where: { id: listId, creator: { id: userId } } })
          const listSpot = await db.listSpot.findFirst({ where: { listId, spotId, list: { creator: { id: userId } } } })

          if (shouldSave) {
            if (listSpot) return badRequest("Already saved to list")
            await db.listSpot.create({ data: { listId, spotId } })
            track("Saved to list", { listId, spotId })
            return json({ success: true })
          }
          if (!listSpot) return badRequest("Not saved to list")
          await db.listSpot.delete({ where: { id: listSpot.id } })
          track("Removed from list", { listId, spotId })
          return json({ success: true })
        }),
    "create-and-save-to-list": () =>
      createAction(request)
        .input(listSchema)
        .handler(async (data) => {
          const list = await db.list.create({ data: { ...data, creatorId: userId, listSpots: { create: { spotId } } } })
          track("Saved to new list", { listId: list.id, spotId })
          return json({ success: true })
        }),
  })
}
