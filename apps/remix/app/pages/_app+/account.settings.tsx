import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import { Switch } from "@ramble/ui"

import { Form, FormButton, FormField } from "~/components/Form"
import { redirect } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request)
  return json(user)
}

export const action = async ({ request }: ActionArgs) => {
  return redirect("/account", request, { flash: { title: "Not possible yet" } })
}

export default function AccountSettings() {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl">Settings</h1>
      <p>Notifications</p>
      <FormField label="Email" name="something" input={<Switch />} />

      <hr />
      <Form>
        <FormButton variant="destructive">Delete account</FormButton>
      </Form>
    </div>
  )
}
