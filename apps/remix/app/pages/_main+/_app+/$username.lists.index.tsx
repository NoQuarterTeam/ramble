import { Link, useLoaderData, useParams } from "@remix-run/react"
import { Lock } from "lucide-react"

import { LinkButton } from "~/components/LinkButton"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import type { LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const headers = useLoaderHeaders

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request)
  const lists = await db.list.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      creator: { username: params.username?.toLowerCase().trim() },
      isPrivate: user.username !== params.username ? false : undefined,
    },
  })
  return json(lists)
}

export default function ProfileLists() {
  const lists = useLoaderData<typeof loader>()
  const params = useParams<{ username: string }>()
  const currentUser = useMaybeUser()
  return (
    <div className="space-y-2">
      {lists.length > 0 && currentUser?.username === params.username && (
        <LinkButton to="new" variant="secondary">
          New list
        </LinkButton>
      )}
      {lists.length === 0 ? (
        <div className="vstack">
          <p className="text-lg">No lists created yet</p>
          <LinkButton to="new">Create one</LinkButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {lists.map((list) => (
            <Link to={list.id} key={list.id} className="rounded-xs border border-hover p-4">
              <div className="flex items-center space-x-2">
                {list.isPrivate && <Lock size={20} />}
                <p className="text-2xl">{list.name}</p>
              </div>
              <p>{list.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
