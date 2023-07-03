import type { NavLinkProps } from "@remix-run/react"
import { Outlet, useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import type { LucideIcon } from "lucide-react"
import { Settings, ToggleRight, User } from "lucide-react"

import { createImageUrl, merge } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { NavLink } from "~/components/NavLink"
import { Avatar, Badge, Icons, buttonSizeStyles, buttonStyles } from "~/components/ui"
import { getCurrentUser } from "~/services/auth/auth.server"

import { PageContainer } from "../../components/PageContainer"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, {
    firstName: true,
    username: true,

    role: true,
    lastName: true,
    avatar: true,
  })
  return json(user)
}

export default function AccountLayout() {
  const user = useLoaderData<typeof loader>()
  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2 py-2">
          <Avatar size="lg" name={`${user.firstName} ${user.lastName}`} src={createImageUrl(user.avatar)} />
          <div>
            <p>
              {user.firstName} {user.lastName}
            </p>
            <Badge
              colorScheme={user.role === "AMBASSADOR" ? "green" : user.role === "OWNER" ? "orange" : "gray"}
              className="w-min"
            >
              {user.role}
            </Badge>
          </div>
        </div>

        <LinkButton size="sm" variant="outline" to={`/${user.username}`}>
          Go to your public profile
        </LinkButton>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:gap-10">
        <div className="flex w-auto flex-row space-x-2 space-y-0 overflow-x-scroll p-1 md:w-[350px] md:flex-col md:space-x-0 md:space-y-0.5">
          <AccountLink to="/account" Icon={User} end>
            Account
          </AccountLink>
          <AccountLink to="/account/interests" Icon={ToggleRight} end>
            Interests
          </AccountLink>
          <AccountLink Icon={Icons.Van} to="/account/van">
            My van
          </AccountLink>
          <AccountLink Icon={Settings} to="/account/settings">
            Settings
          </AccountLink>
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  )
}

function AccountLink({ Icon, children, ...props }: NavLinkProps & { Icon: LucideIcon; children: React.ReactNode }) {
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
      <Icon className="sq-4 opacity-60" />
      <span>{children}</span>
    </NavLink>
  )
}
