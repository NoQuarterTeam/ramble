import { Button } from "@ramble/ui"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
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
  const currentUser = useMaybeUser()
  return (
    <div>
      {currentUser?.id === user.id && <Button variant="secondary">New list</Button>}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {user.lists.map((list) => (
          <div key={list.id}>
            <p>{list.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
