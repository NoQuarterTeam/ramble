import { type ActionFunctionArgs } from "@remix-run/node"
import { z } from "zod"

import { sendSlackMessage } from "@ramble/api"
import { FeedbackType } from "@ramble/database/types"

import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { createAction, createActions } from "~/lib/form.server"
import { badRequest, json } from "~/lib/remix.server"
import { type Actions } from "~/pages/api+/feedback"

import { getCurrentUser } from "../auth/auth.server"

const createSchema = z.object({ message: z.string().min(10), type: z.nativeEnum(FeedbackType) })

export type CreateSchema = typeof createSchema

export const feedbackActions = ({ request }: ActionFunctionArgs) =>
  createActions<Actions>(request, {
    create: () =>
      createAction(request)
        .input(createSchema)
        .handler(async (data) => {
          try {
            const user = await getCurrentUser(request)
            const feedback = await db.feedback.create({ data: { ...data, userId: user.id }, include: { user: true } })
            sendSlackMessage(`🙏 New feedback submitted (${data.type}) by @${user.username}: ` + data.message)
            track("Feedback created", { feedbackId: feedback.id, userId: user.id })
            return json({ success: true }, request, {
              flash: { type: "success", title: "Feedback sent", description: "We'll take a look as soon as possible" },
            })
          } catch (e: unknown) {
            return badRequest(e instanceof Error ? e.message : "Error", request, {
              flash: { type: "error", title: "Error creating feedback" },
            })
          }
        }),
  })
