import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { NavLinkProps } from "@remix-run/react"
import { NavLink, Outlet, useLoaderData } from "@remix-run/react"
import { Instagram, type LucideIcon } from "lucide-react"

import { createImageUrl, merge, userInterestFields } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { Avatar, Badge, buttonSizeStyles, buttonStyles, Tooltip } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { notFound } from "~/lib/remix.server"
import { interestOptions } from "~/lib/static/interests"

import { PageContainer } from "../../../components/PageContainer"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const user = await db.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      avatar: true,
      avatarBlurHash: true,
      role: true,
      firstName: true,
      username: true,
      instagram: true,
      lastName: true,
      bio: true,
      ...userInterestFields,
    },
  })
  if (!user) throw notFound(null)

  return json(user)
}

export default function ProfileLists() {
  const user = useLoaderData<typeof loader>()

  const currentUser = useMaybeUser()
  return (
    <PageContainer>
      <div className="grid grid-cols-1 items-center gap-4 py-6 md:grid-cols-2 md:py-8">
        <div className="flex items-center space-x-3">
          <Avatar size={100} placeholder={user.avatarBlurHash} className="sq-20 md:sq-32" src={createImageUrl(user.avatar)} />
          <div className="space-y-1">
            {user.role === "AMBASSADOR" && <Badge colorScheme="green">Ambassador</Badge>}
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
            {user.instagram && (
              <a
                rel="noopener noreferrer"
                aria-label="Go to user's instagram"
                target="_blank"
                href={`https://www.instagram.com/${user.instagram}`}
              >
                <Instagram />
              </a>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex space-x-2">
            {interestOptions
              .filter((i) => user[i.value as keyof typeof user])
              .map((interest) => (
                <Tooltip key={interest.value} label={interest.label}>
                  <div className="rounded-md border border-gray-100 p-2 dark:border-gray-700">
                    <interest.Icon className="sq-6" />
                  </div>
                </Tooltip>
              ))}
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
