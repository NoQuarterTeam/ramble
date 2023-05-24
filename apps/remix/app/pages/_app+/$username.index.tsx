import { createImageUrl } from "@ramble/shared"
import { Avatar } from "@ramble/ui"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound } from "~/lib/remix.server"
import { PageContainer } from "../../components/PageContainer"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const user = await db.user.findFirst({
    where: { isProfilePublic: { equals: true }, username: params.username },
    include: { van: true },
  })
  if (!user) throw notFound(null)

  return json(user, {
    headers: {
      "Cache-Control": cacheHeader({
        maxAge: "1day",
        sMaxage: "1day",
        staleWhileRevalidate: "1week",
        public: true,
      }),
    },
  })
}

export default function Profile() {
  const user = useLoaderData<typeof loader>()

  return (
    <PageContainer>
      <div className="flex flex-col items-center space-y-1">
        <Avatar className="sq-32" src={createImageUrl(user.avatar)} name={`${user.firstName} ${user.lastName}`} />
        <h1 className="text-3xl">{user.username}</h1>
        <p>
          {user.firstName} {user.lastName}
        </p>
      </div>
    </PageContainer>
  )
}
