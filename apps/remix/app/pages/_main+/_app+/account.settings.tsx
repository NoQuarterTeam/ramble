import { useFetcher } from "@remix-run/react"
import { MapPin } from "lucide-react"
import { z } from "zod"
import { zx } from "zodix"

import { Form, FormButton, FormField } from "~/components/Form"
import { Switch } from "~/components/ui"
import { db } from "~/lib/db.server"
import { FORM_ACTION } from "~/lib/form"
import { createAction, createActions } from "~/lib/form.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { redirect } from "~/lib/remix.server"
import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { getCurrentUser } from "~/services/auth/auth.server"

enum Actions {
  DeleteAccount = "deleteAccount",
  UpdateSettings = "updateSettings",
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request)
  return createActions<Actions>(request, {
    deleteAccount: () =>
      createAction(request).handler(() => {
        return redirect("/account", request, {
          flash: { title: "Not possible yet", description: "Please contact info@noquarter.co to delete your account" },
        })
      }),
    updateSettings: () =>
      createAction(request)
        .input(z.object({ isLocationPrivate: zx.BoolAsString }))
        .handler(async (data) => {
          await db.user.update({ where: { id: user.id }, data: { isLocationPrivate: data.isLocationPrivate } })
          return redirect("/account/settings", request, { flash: { title: "Settings updated" } })
        }),
  })
}

export default function AccountSettings() {
  const user = useMaybeUser()
  const fetcher = useFetcher()
  return (
    <div className="space-y-2">
      <h1 className="text-3xl">Settings</h1>

      <div className="flex flex-row items-center justify-between space-x-2">
        <div className="flex flex-row items-center space-x-3">
          <MapPin size={30} />
          <div>
            <p className="text-lg">Hide location</p>
            <p className="text-sm opacity-75">Hide your location on map. (It's only a rough estimate anyway)</p>
          </div>
        </div>

        <FormField
          defaultChecked={user?.isLocationPrivate}
          name="isLocationPrivate"
          input={
            <Switch
              onCheckedChange={(val) => {
                fetcher.submit({ isLocationPrivate: val, [FORM_ACTION]: Actions.UpdateSettings }, { method: "post" })
              }}
            />
          }
        />
      </div>

      <hr />
      <Form>
        <FormButton value={Actions.DeleteAccount} variant="destructive">
          Delete account
        </FormButton>
      </Form>
    </div>
  )
}
