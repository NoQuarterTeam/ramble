import { Modal } from "@ramble/ui"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useNavigate } from "@remix-run/react"
import { z } from "zod"
import { Form, FormButton, FormError, FormField } from "~/components/Form"

import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound, redirect } from "~/lib/remix.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const headers = useLoaderHeaders

export const loader = async ({ request, params }: LoaderArgs) => {
  const user = await getCurrentUser(request)
  if (!user) throw notFound(null)
  if (user.username !== params.username) throw notFound(null)
  return json(user)
}

export const action = async ({ request }: ActionArgs) => {
  const user = await getCurrentUser(request)
  const schema = z.object({
    name: z.string().min(1, "List name must be at least 1 character"),
  })
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)

  await db.list.create({ data: { name: result.data.name, creator: { connect: { id: user.id } } } })
  return redirect(`/${user.username}/lists`, request, {
    flash: { title: "List created", description: "Start adding some spots!" },
  })
}

export default function NewList() {
  const navigate = useNavigate()
  return (
    <Modal title="New list" isOpen onClose={() => navigate(-1)}>
      <Form className="space-y-2">
        <FormField label="Name" name="name" />
        <FormError />
        <FormButton>Create</FormButton>
      </Form>
    </Modal>
  )
}
