import { z } from "zod"
import { CheckboxAsString } from "zodix"

import { track } from "~/lib/analytics.server"
import { createAction, createActions } from "~/lib/form.server"
import { redirect } from "~/lib/remix.server"
import { type ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { type Actions } from "~/pages/api+/gdpr"

import { getGdprSession } from "../session/gdpr.server"
import { getUserSession } from "../session/session.server"

export const gdprActions = ({ request }: ActionFunctionArgs) =>
  createActions<Actions>(request, {
    save: () =>
      createAction(request)
        .input(z.object({ isAnalyticsEnabled: CheckboxAsString }))
        .handler(async (data) => {
          const { userId } = await getUserSession(request)
          const gdprSession = await getGdprSession(request)
          gdprSession.setGdpr(data)
          track("GDPR set", { userId, ...data })
          return redirect("/", request, { headers: { "set-cookie": await gdprSession.commit() } })
        }),
  })
