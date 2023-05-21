import { join } from "@ramble/shared"
import { inputStyles, Textarea } from "@ramble/ui"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { z } from "zod"
import { Form, FormButton, FormField, ImageField } from "~/components/Form"
import { db } from "~/lib/db.server"
import { NullableFormString, validateFormData, formError } from "~/lib/form"
import { redirect } from "~/lib/remix.server"

import { getCurrentUser } from "~/services/auth/auth.server"
import { FlashType } from "~/services/session/flash.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, { email: true, firstName: true, lastName: true, avatar: true, bio: true })
  return json(user)
}

export const action = async ({ request }: ActionArgs) => {
  const user = await getCurrentUser(request, { id: true, van: { select: { id: true } } })
  const schema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    bio: NullableFormString,
    avatar: NullableFormString,
  })
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  await db.user.update({ where: { id: user.id }, data: result.data })
  return redirect("/profile", request, { flash: { type: FlashType.Info, title: "Profile updated" } })
}

export default function Profile() {
  const user = useLoaderData<typeof loader>()

  return (
    <Form method="post" replace className="space-y-4" action="/profile?index">
      <h1 className="text-3xl">Profile</h1>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="space-y-2">
          <FormField defaultValue={user.firstName} name="firstName" label="First name" />
          <FormField defaultValue={user.lastName} name="lastName" label="Last name" />
          <FormField defaultValue={user.email} name="email" label="Email" />
          <FormField defaultValue={user.bio || ""} name="bio" label="Bio" input={<Textarea rows={5} />} />
        </div>
        <ImageField className={join("sq-52", inputStyles())} defaultValue={user.avatar} name="avatar" label="Avatar" />
      </div>
      <FormButton>Save</FormButton>
    </Form>
  )
}
