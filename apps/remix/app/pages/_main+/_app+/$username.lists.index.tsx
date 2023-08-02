import { Link, useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { LinkButton } from "~/components/LinkButton"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { notFound } from "~/lib/remix.server"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const user = await db.user.findUnique({ where: { username: params.username }, include: { lists: true } })
  if (!user) throw notFound()
  return json(user, { headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour" }) } })
}

export default function ProfileLists() {
  const user = useLoaderData<typeof loader>()
  const currentUser = useMaybeUser()
  return (
    <div className="space-y-2">
      {currentUser?.id === user.id && (
        <LinkButton to="new" variant="secondary">
          New list
        </LinkButton>
      )}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {user.lists.map((list) => (
          <Link
            to={list.id}
            key={list.id}
            className="rounded-md border border-gray-100 p-4 hover:border-gray-200 dark:border-gray-700 dark:hover:border-gray-500"
          >
            <p className="text-2xl">{list.name}</p>
            <p className="text-sm">{list.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
