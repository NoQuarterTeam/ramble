import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { ChevronLeft } from "lucide-react"

import { createImageUrl } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { PageContainer } from "~/components/PageContainer"
import { Avatar } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound } from "~/lib/remix.server"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const user = await db.user.findUnique({ where: { username: params.username }, include: { following: true } })
  if (!user) throw notFound(null)
  return json(user)
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
          <h1 className="text-3xl">{user.firstName}'s following</h1>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {user.following.map((user) => (
            <Link
              to={`/${user.username}`}
              key={user.id}
              className="flex items-center space-x-2 rounded-md border border-gray-100 p-4 hover:border-gray-200 dark:border-gray-700 dark:hover:border-gray-500"
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
