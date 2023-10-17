import { track } from "~/lib/analytics.server"
import { FormCheckbox, createAction, createActions } from "~/lib/form.server"
import { json } from "~/lib/remix.server"
import { Actions } from "~/pages/api+/gdpr"
import { getGdprSession } from "../session/gdpr.server"
import { ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { getUserSession } from "../session/session.server"
import { z } from "~/lib/vendor/zod.server"

export const gdprActions = ({ request }: ActionFunctionArgs) =>
  createActions<Actions>(request, {
    save: createAction(request)
      .input(z.object({ isAnalyticsEnabled: FormCheckbox }))
      .handler(async (data) => {
        const { userId } = await getUserSession(request)
        const gdprSession = await getGdprSession(request)
        gdprSession.setGdpr(data)
        track("GDPR set", { userId, ...data })
        return json({ success: true }, request, { headers: { "set-cookie": await gdprSession.commit() } })
      }),
  })
