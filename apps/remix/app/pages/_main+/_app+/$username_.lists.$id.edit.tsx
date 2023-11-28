import { useLoaderData } from "@remix-run/react"

import { listSchema } from "@ramble/server-schemas"

import { PageContainer } from "~/components/PageContainer"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound, redirect } from "~/lib/remix.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { getCurrentUser, requireUser } from "~/services/auth/auth.server"

import { ListForm } from "./components/ListForm"

export const headers = useLoaderHeaders

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUser(request)
  const list = await db.list.findFirst({
    where: { id: params.id, creatorId: userId },
    select: { id: true, name: true, description: true, isPrivate: true },
  })
  if (!list) throw notFound()
  return json(list)
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request)
  const list = await db.list.findFirst({
    where: { id: params.id, creatorId: user.id },
  })
  if (!list) throw redirect(`/${user.username}/lists`, request, { flash: { title: "List not found" } })
  const result = await validateFormData(request, listSchema)
  if (!result.success) return formError(result)
  const { name, description } = result.data
  await db.list.update({ where: { id: list.id }, data: { name, description } })
  track("List updated", { listId: list.id, userId: user.id })
  return redirect(`/${user.username}/lists/${list.id}`, request, { flash: { title: "List updated" } })
}

export default function ListDetail() {
  const list = useLoaderData<typeof loader>()
  return (
    <PageContainer>
      <ListForm list={list} />
    </PageContainer>
  )
}
