import type { NavLinkProps } from "@remix-run/react"
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { Instagram, type LucideIcon } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"

import { createImageUrl, merge, userInterestFields } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { Avatar, Badge, buttonSizeStyles, buttonStyles, Tooltip } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { notFound } from "~/lib/remix.server"
import { interestOptions } from "~/lib/static/interests"

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
      _count: {
        select: { followers: true, following: true },
      },
      ...userInterestFields,
    },
  })
  if (!user) throw notFound()

  return json(user, { headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour" }) } })
}

export default function ProfileLists() {
  const user = useLoaderData<typeof loader>()

  const currentUser = useMaybeUser()
  return (
    <div className="mx-auto px-4 pb-20 lg:px-12">
      <div className="grid grid-cols-10 gap-6">
        <div className="col-span-10 md:col-span-3">
          <div className="md:top-nav relative flex flex-col gap-4 py-6 md:sticky md:py-16">
            <div className="flex items-center space-x-3">
              <Avatar
                size={200}
                placeholder={user.avatarBlurHash}
                className="sq-28 md:sq-20 xl:sq-32"
                src={createImageUrl(user.avatar)}
              />
              <div className="space-y-1">
                {user.role === "GUIDE" && <Badge colorScheme="green">Guide</Badge>}

                <h1 className="text-2xl md:text-xl lg:text-3xl">{user.username}</h1>

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
              <div className="flex items-center space-x-4">
                <Link to="following" className="hover:underline">
                  <span className="font-semibold">{user._count?.following}</span> following
                </Link>
                <Link to="followers" className="hover:underline">
                  <span className="font-semibold">{user._count?.followers}</span> followers
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {interestOptions
                  .filter((i) => user[i.value as keyof typeof user])
                  .map((interest) => (
                    <Tooltip key={interest.value} label={interest.label}>
                      <div className="rounded-xs border p-2">
                        <interest.Icon className="sq-4 lg:sq-6" />
                      </div>
                    </Tooltip>
                  ))}
              </div>
              <p className="text-sm">{user.bio}</p>
            </div>
            {currentUser?.id === user.id && (
              <LinkButton size="sm" to="/account" variant="outline">
                Edit profile
              </LinkButton>
            )}
          </div>
        </div>

        <div className="col-span-10 space-y-4 md:col-span-7">
          <div className="top-nav bg-background sticky z-[1] mx-auto flex w-full items-center justify-center space-x-1 py-4">
            <div>
              <ProfileLink to={`/${user.username}`} end>
                Spots
              </ProfileLink>
            </div>
            <div>
              <ProfileLink to={`/${user.username}/van`}>Van</ProfileLink>
            </div>
            <div>
              <ProfileLink to={`/${user.username}/lists`}>Lists</ProfileLink>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function ProfileLink({ Icon, children, ...props }: NavLinkProps & { Icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <NavLink
      {...props}
      to={props.to}
      className={({ isActive }) =>
        merge(
          buttonStyles({ size: "lg", variant: isActive ? "secondary" : "ghost" }),
          buttonSizeStyles({ size: "lg" }),
          "flex w-full items-center justify-start space-x-2 text-left",
        )
      }
    >
      {Icon && <Icon className="sq-4 opacity-60" />}
      <span>{children}</span>
    </NavLink>
  )
}
