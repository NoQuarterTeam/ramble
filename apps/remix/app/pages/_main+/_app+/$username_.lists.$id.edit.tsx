import { useLoaderData } from "@remix-run/react"
import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { z } from "zod"

import { PageContainer } from "~/components/PageContainer"
import { db } from "~/lib/db.server"
import { formError, NullableFormString, validateFormData } from "~/lib/form"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound, redirect } from "~/lib/remix.server"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

import { ListForm } from "./components/ListForm"

export const headers = useLoaderHeaders

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUser(request)
  const list = await db.list.findFirst({
    where: { id: params.id, creatorId: userId },
    select: { id: true, name: true, description: true },
  })
  if (!list) throw notFound()
  return json(list)
}

export const action = async ({ request, params }: ActionArgs) => {
  const user = await getCurrentUser(request)
  const list = await db.list.findFirst({
    where: { id: params.id, creatorId: user.id },
  })
  if (!list) throw redirect(`/${user.username}/lists`, request, { flash: { title: "List not found" } })
  const schema = z.object({
    name: z.string().min(1, "List name must be at least 1 character"),
    description: NullableFormString,
  })
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const { name, description } = result.data
  await db.list.update({
    where: { id: list.id },
    data: { name, description },
  })
  return redirect(`/${user.username}/lists/${list.id}`, request, {
    flash: { title: "List updated" },
  })
}

export default function ListDetail() {
  const list = useLoaderData<typeof loader>()
  return (
    <PageContainer>
      <ListForm list={list} />
    </PageContainer>
  )
}
