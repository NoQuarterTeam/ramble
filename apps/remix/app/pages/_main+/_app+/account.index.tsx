import { useLoaderData } from "@remix-run/react"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { AtSign } from "lucide-react"
import { z } from "zod"

import { generateBlurHash } from "@ramble/api"
import { join } from "@ramble/shared"

import { Form, FormButton, FormField, ImageField } from "~/components/Form"
import { Input, inputStyles, Textarea } from "~/components/ui"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, NullableFormString, validateFormData } from "~/lib/form"
import { redirect } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, {
    bio: true,
    email: true,
    avatar: true,
    username: true,
    firstName: true,
    instagram: true,
    lastName: true,
  })
  return json(user)
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request, { id: true, avatarBlurHash: true, avatar: true })
  const schema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    instagram: NullableFormString,
    username: z
      .string()
      .min(2)
      .refine((username) => !username.trim().includes(" "), "Username can not contain empty spaces"),
    email: z.string().email(),
    bio: NullableFormString,
    avatar: NullableFormString,
  })
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const username = result.data.username.toLowerCase().trim()
  const existingUsername = await db.user.findFirst({ where: { username, id: { not: { equals: user.id } } } })
  if (existingUsername) return formError({ formError: "User with this username already exists" })
  let avatarBlurHash = user.avatarBlurHash
  if (result.data.avatar && result.data.avatar !== user.avatar) {
    avatarBlurHash = await generateBlurHash(result.data.avatar)
  }
  await db.user.update({ where: { id: user.id }, data: { ...result.data, avatarBlurHash } })
  track("Account updated", { userId: user.id })
  return redirect("/account", request, { flash: { title: "Account updated" } })
}

export default function Account() {
  const user = useLoaderData<typeof loader>()

  return (
    <Form className="space-y-4" action="/account?index">
      <h1 className="text-3xl">Account</h1>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="space-y-2">
          <FormField defaultValue={user.firstName} name="firstName" label="First name" />
          <FormField defaultValue={user.lastName} name="lastName" label="Last name" />
          <FormField autoCapitalize="none" defaultValue={user.email} name="email" label="Email" />
          <FormField defaultValue={user.bio || ""} name="bio" label="Bio" input={<Textarea rows={5} />} />
          <FormField
            defaultValue={user.instagram || ""}
            name="instagram"
            label="Instragram handle"
            input={<Input leftElement={<AtSign size={18} />} />}
          />
        </div>
        <div className="space-y-2">
          <FormField autoCapitalize="none" defaultValue={user.username || ""} name="username" label="Username" />

          <ImageField className={join("sq-52", inputStyles())} defaultValue={user.avatar} name="avatar" label="Avatar" />
        </div>
      </div>
      <FormButton>Save</FormButton>
    </Form>
  )
}
