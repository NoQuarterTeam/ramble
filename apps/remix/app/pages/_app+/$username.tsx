import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { NavLinkProps } from "@remix-run/react"
import { NavLink, Outlet, useLoaderData } from "@remix-run/react"
import type { LucideIcon } from "lucide-react"
import { Bike, Footprints, Mountain, Waves } from "lucide-react"
import { Dog } from "lucide-react"

import { createImageUrl, merge, userInterestFields } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { Avatar, Badge, buttonSizeStyles, buttonStyles, Icons, Tooltip } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { notFound } from "~/lib/remix.server"
import { getUserSession } from "~/services/session/session.server"

import { PageContainer } from "../../components/PageContainer"

export const headers = useLoaderHeaders

export const loader = async ({ request, params }: LoaderArgs) => {
  const { userId } = await getUserSession(request)
  const user = await db.user.findFirst({
    select: {
      id: true,
      isProfilePublic: true,
      avatar: true,
      role: true,
      firstName: true,
      username: true,
      lastName: true,
      bio: true,
      ...userInterestFields,
    },
    where: { username: params.username },
  })
  if (!user) throw notFound(null)

  if (userId !== user.id && !user.isProfilePublic) throw notFound(null)

  return json(user)
}

export default function ProfileLists() {
  const user = useLoaderData<typeof loader>()

  const currentUser = useMaybeUser()
  return (
    <PageContainer>
      <div className="grid grid-cols-1 items-center gap-4 py-6 md:grid-cols-2 md:py-8">
        <div className="flex items-center space-x-3">
          <Avatar className="sq-20 md:sq-32" src={createImageUrl(user.avatar)} name={`${user.firstName} ${user.lastName}`} />
          <div className="space-y-1">
            <div className="flex space-x-2">
              <h1 className="text-xl md:text-3xl">{user.username}</h1>
              {currentUser?.id === user.id && (
                <LinkButton size="sm" to="/account" variant="outline">
                  Edit profile
                </LinkButton>
              )}
            </div>
            <p>
              {user.firstName} {user.lastName}
            </p>
            {user.role === "AMBASSADOR" && <Badge colorScheme="green">Ambassador</Badge>}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex space-x-2">
            {user.isSurfer && (
              <Tooltip label="Surfer">
                <div className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                  <Icons.Surf className="sq-6" />
                </div>
              </Tooltip>
            )}
            {user.isPetOwner && (
              <Tooltip label="Pet owner">
                <div className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                  <Dog className="sq-6" />
                </div>
              </Tooltip>
            )}
            {user.isClimber && (
              <Tooltip label="Climber">
                <div className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                  <Mountain className="sq-6" />
                </div>
              </Tooltip>
            )}
            {user.isHiker && (
              <Tooltip label="Hiker">
                <div className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                  <Footprints className="sq-6" />
                </div>
              </Tooltip>
            )}
            {user.isMountainBiker && (
              <Tooltip label="Mountain biker">
                <div className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                  <Bike className="sq-6" />
                </div>
              </Tooltip>
            )}
            {user.isPaddleBoarder && (
              <Tooltip label="Paddle boarder">
                <div className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                  <Waves className="sq-6" />
                </div>
              </Tooltip>
            )}
          </div>
          <p className="text-sm">{user.bio}</p>
        </div>
      </div>
      <div className="mx-auto flex w-min space-x-1">
        <ProfileLink to={`/${user.username}`} end>
          Spots
        </ProfileLink>
        <ProfileLink to={`/${user.username}/van`}>Van</ProfileLink>
        <ProfileLink to={`/${user.username}/lists`}>Lists</ProfileLink>
      </div>
      <Outlet />
    </PageContainer>
  )
}

function ProfileLink({ Icon, children, ...props }: NavLinkProps & { Icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <NavLink
      {...props}
      to={props.to}
      className={({ isActive }) =>
        merge(
          buttonStyles({ size: "md", variant: isActive ? "secondary" : "ghost" }),
          buttonSizeStyles({ size: "md" }),
          "flex w-full items-center justify-start space-x-2 text-left",
        )
      }
    >
      {Icon && <Icon className="sq-4 opacity-60" />}
      <span>{children}</span>
    </NavLink>
  )
}
