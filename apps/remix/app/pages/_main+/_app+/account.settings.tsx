import { Form, FormButton, FormField } from "~/components/Form"
import { Switch } from "~/components/ui"
import { redirect } from "~/lib/remix.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request)
  return json(user)
}

export const action = async ({ request }: ActionFunctionArgs) => {
  return redirect("/account", request, {
    flash: { title: "Not possible yet", description: "Please contact info@noquarter.co to delete your account" },
  })
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
