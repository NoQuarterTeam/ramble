import { Link, useLoaderData, useParams } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { LinkButton } from "~/components/LinkButton"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const lists = await db.list.findMany({ orderBy: { createdAt: "desc" }, where: { creator: { username: params.username } } })
  return json(lists, { headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour" }) } })
}

export default function ProfileLists() {
  const lists = useLoaderData<typeof loader>()
  const params = useParams<{ username: string }>()
  const currentUser = useMaybeUser()
  return (
    <div className="space-y-2">
      {currentUser?.username === params.username && (
        <LinkButton to="new" variant="secondary">
          New list
        </LinkButton>
      )}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {lists.map((list) => (
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
