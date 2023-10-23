import { track } from "@vercel/analytics/server"
import { z } from "zod"
import { zx } from "zodix"

import { db } from "~/lib/db.server"
import { createAction, createActions } from "~/lib/form.server"
import { badRequest, json } from "~/lib/remix.server"
import { type ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { type Actions } from "~/pages/api+/save-to-list"

import { requireUser } from "../auth/auth.server"

const createListSchema = z.object({ name: z.string().min(1), description: z.string().optional(), spotId: z.string() })

export type CreateListSchema = typeof createListSchema

export const actions = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUser(request)
  return createActions<Actions>(request, {
    "toggle-save": () =>
      createAction(request)
        .input(z.object({ shouldSave: zx.BoolAsString, listId: z.string(), spotId: z.string() }))
        .handler(async ({ shouldSave, listId, spotId }) => {
          await db.list.findFirstOrThrow({ select: { id: true }, where: { id: listId, creator: { id: userId } } })
          const listSpot = await db.listSpot.findFirst({ where: { listId, spotId, list: { creator: { id: userId } } } })

          if (shouldSave) {
            if (listSpot) return badRequest("Already saved to list", request, { flash: { title: "Already saved to list" } })
            await db.listSpot.create({ data: { listId, spotId } })
            track("Saved to list", { listId, spotId })
            return json({ success: true }, request, { flash: { title: "Saved to list" } })
          } else {
            if (!listSpot) return badRequest("Not saved to list", request, { flash: { title: "Not saved to list" } })
            await db.listSpot.delete({ where: { id: listSpot.id } })
            track("Removed from list", { listId, spotId })
            return json({ success: true }, request, { flash: { title: "Removed from list" } })
          }
        }),
    "create-and-save-to-list": () =>
      createAction(request)
        .input(createListSchema)
        .handler(async ({ spotId, ...data }) => {
          const list = await db.list.create({ data: { ...data, creatorId: userId, listSpots: { create: { spotId } } } })
          track("Saved to new list", { listId: list.id, spotId })
          return json({ success: true }, request, { flash: { title: "List created", description: "Spot saved to new list" } })
        }),
  })
}
