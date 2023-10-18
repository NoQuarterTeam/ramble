import type { NavLinkProps } from "@remix-run/react"
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react"
import { Instagram, type LucideIcon } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import { z } from "zod"
import { zx } from "zodix"

import { createImageUrl, merge, userInterestFields } from "@ramble/shared"

import { Form, FormButton } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { Avatar, Badge, buttonSizeStyles, buttonStyles, Tooltip } from "~/components/ui"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { interestOptions } from "~/lib/models/user"
import { notFound } from "~/lib/remix.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { getCurrentUser, getMaybeUser } from "~/services/auth/auth.server"

export const headers = useLoaderHeaders

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const currentUser = await getMaybeUser(request)
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
      followers: currentUser ? { where: { id: currentUser.id } } : undefined,
      _count: {
        select: { followers: true, following: true },
      },
      ...userInterestFields,
    },
  })
  if (!user) throw notFound()

  return json(
    { ...user, isFollowed: user.followers && user.followers.length > 0 },
    {
      headers: {
        "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }),
      },
    },
  )
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request)
  const schema = z.object({ shouldFollow: zx.BoolAsString })
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  if (user.username === params.username) return json({ success: false, message: "You can't follow yourself" })
  const shouldFollow = result.data.shouldFollow
  await db.user.update({
    where: { username: params.username },
    data: { followers: shouldFollow ? { connect: { id: user.id } } : { disconnect: { id: user.id } } },
  })
  track(shouldFollow ? "User followed" : "User unfollowed", { username: params.username || "", userId: user.id })
  return json({ success: true })
}

export default function ProfileLists() {
  const user = useLoaderData<typeof loader>()

  const currentUser = useMaybeUser()
  return (
    <div className="mx-auto px-4 pb-20 lg:px-12">
      <div className="grid grid-cols-10 gap-6">
        <div className="col-span-10 lg:col-span-4 xl:col-span-3">
          <div className="md:top-nav relative pt-4 md:sticky">
            <div className="rounded-xs flex flex-col gap-4 border p-4">
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
                {!currentUser ? (
                  <LinkButton to={`/login?redirectTo=/${user.username}`}>Follow</LinkButton>
                ) : currentUser.username === user.username ? null : (
                  <Form>
                    <input type="hidden" name="shouldFollow" value={String(!user.isFollowed)} />
                    <FormButton variant={user.isFollowed ? "outline" : "primary"} size="sm">
                      {user.isFollowed ? "Unfollow" : "Follow"}
                    </FormButton>
                  </Form>
                )}
                <div className="flex flex-wrap gap-2">
                  {interestOptions
                    .filter((i) => user[i.value as keyof typeof user])
                    .map((interest) => (
                      <Tooltip side="bottom" key={interest.value} label={interest.label}>
                        <div className="rounded-xs border p-2">
                          <interest.Icon className="sq-5" />
                        </div>
                      </Tooltip>
                    ))}
                </div>
                <p>{user.bio}</p>
              </div>
              {currentUser?.id === user.id && (
                <LinkButton size="sm" to="/account" variant="outline">
                  Edit profile
                </LinkButton>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-10 space-y-4 lg:col-span-6 xl:col-span-7">
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
