import { useFetcher } from "@remix-run/react"
import { Languages, MapPin } from "lucide-react"

import { userSchema } from "@ramble/server-schemas"
import { languages } from "@ramble/shared"

import { Form, FormButton, FormField } from "~/components/Form"
import { Select, Switch } from "~/components/ui"
import { db } from "~/lib/db.server"
import { FORM_ACTION, FormActionInput } from "~/lib/form"
import { createAction, createActions } from "~/lib/form.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { json, redirect } from "~/lib/remix.server"
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
        .input(userSchema.pick({ isLocationPrivate: true, preferredLanguage: true }))
        .handler(async (data) => {
          await db.user.update({ where: { id: user.id }, data })
          return json({ success: true }, request, { flash: { title: "Settings updated" } })
        }),
  })
}

export default function AccountSettings() {
  const user = useMaybeUser()
  const fetcher = useFetcher()
  return (
    <div className="space-y-4">
      <h1 className="text-3xl">Settings</h1>
      <Form>
        <FormActionInput value={Actions.UpdateSettings} />
        <div className="flex flex-col justify-between gap-2 space-x-2 md:flex-row md:items-center">
          <div className="flex flex-row items-center space-x-3">
            <Languages size={30} />
            <div>
              <p className="text-lg">Spot description language</p>
              <p className="text-sm opacity-75">Control what language to show for the spot description</p>
            </div>
          </div>

          <FormField
            name="preferredLanguage"
            input={
              <Select
                defaultValue={user?.preferredLanguage || ""}
                onChange={(e) => {
                  e.currentTarget.form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
                }}
              >
                <option value="" disabled selected>
                  Default
                </option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </Select>
            }
          />
        </div>
      </Form>

      <div className="flex flex-col justify-between gap-2 space-x-2 md:flex-row md:items-center">
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
