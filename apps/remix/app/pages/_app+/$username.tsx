import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { NavLinkProps } from "@remix-run/react"
import { NavLink, Outlet, useLoaderData } from "@remix-run/react"

import { createImageUrl, merge } from "@ramble/shared"
import { Avatar, Badge, Tooltip, buttonSizeStyles, buttonStyles } from "@ramble/ui"

import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound } from "~/lib/remix.server"

import type { LucideIcon } from "lucide-react"
import { Bike, Footprints, Mountain, Waves } from "lucide-react"
import { Dog } from "lucide-react"
import { PageContainer } from "../../components/PageContainer"
import { LinkButton } from "~/components/LinkButton"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const user = await db.user.findFirst({
    select: {
      id: true,
      avatar: true,
      role: true,
      firstName: true,
      username: true,
      lastName: true,
      bio: true,
      isClimber: true,
      isMountainBiker: true,
      isPetOwner: true,
      isPaddleBoarder: true,
      isHiker: true,
    },
    where: { isProfilePublic: { equals: true }, username: params.username },
  })
  if (!user) throw notFound(null)

  return json(user)
}

export default function ProfileLists() {
  const user = useLoaderData<typeof loader>()

  return (
    <PageContainer>
      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
        <div className="flex items-center space-x-3 py-10">
          <Avatar className="sq-32" src={createImageUrl(user.avatar)} name={`${user.firstName} ${user.lastName}`} />
          <div className="space-y-1">
            <div className="flex space-x-2">
              <h1 className="text-3xl">{user.username}</h1>
              <LinkButton size="sm" to="/account" variant="outline">
                Edit profile
              </LinkButton>
            </div>
            <p>
              {user.firstName} {user.lastName}
            </p>
            {user.role === "AMBASSADOR" && <Badge colorScheme="green">Ambassador</Badge>}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex space-x-2">
            {user.isPetOwner && (
              <Tooltip label="Pet owner">
                <Dog className="sq-6" />
              </Tooltip>
            )}
            {user.isClimber && (
              <Tooltip label="Climber">
                <Mountain className="sq-6" />
              </Tooltip>
            )}
            {user.isHiker && (
              <Tooltip label="Hiker">
                <Footprints className="sq-6" />
              </Tooltip>
            )}
            {user.isMountainBiker && (
              <Tooltip label="Mountain biker">
                <Bike className="sq-6" />
              </Tooltip>
            )}
            {user.isPaddleBoarder && (
              <Tooltip label="Paddle boarder">
                <Waves className="sq-6" />
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
