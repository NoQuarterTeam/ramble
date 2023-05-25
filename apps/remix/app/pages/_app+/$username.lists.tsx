import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound } from "~/lib/remix.server"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const user = await db.user.findFirst({
    where: { isProfilePublic: { equals: true }, username: params.username },
    include: { lists: true },
  })
  if (!user) throw notFound(null)

  return json(user)
}

export default function ProfileLists() {
  const user = useLoaderData<typeof loader>()

  return <div>Lists {user.firstName}</div>
}
