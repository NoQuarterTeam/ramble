import { Link, useLoaderData } from "@remix-run/react"
import type { LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { ChevronLeft } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"

import { createImageUrl } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { PageContainer } from "~/components/PageContainer"
import { Avatar } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound } from "~/lib/remix.server"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const user = await db.user.findUnique({ where: { username: params.username }, include: { followers: true } })
  if (!user) throw notFound()
  return json(user, {
    headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }) },
  })
}

export default function ProfileFollowers() {
  const user = useLoaderData<typeof loader>()

  return (
    <PageContainer>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <LinkButton
            size="sm"
            leftIcon={<ChevronLeft className="sq-3" />}
            // @ts-expect-error remix accepts numbers
            to={-1}
            variant="outline"
          >
            Back
          </LinkButton>
          <h1 className="text-3xl">{user.firstName}'s followers</h1>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {user.followers.map((user) => (
            <Link
              to={`/${user.username}`}
              key={user.id}
              className="border-hover rounded-xs flex items-center space-x-2 border p-4"
            >
              <Avatar size={100} className="sq-16" src={createImageUrl(user.avatar)} placeholder={user.avatarBlurHash} />
              <p className="text-2xl">{user.firstName}</p>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
