import type { NavLinkProps } from "@remix-run/react"
import { Outlet, useLoaderData } from "@remix-run/react"

import { Avatar } from "@ramble/ui"

import { join } from "@ramble/shared"
import type { LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import type { LucideIcon } from "lucide-react"
import { Settings, Truck, User } from "lucide-react"
import { NavLink } from "~/components/NavLink"
import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, { firstName: true, lastName: true, avatar: true })
  return json(user)
}

export default function ProfileLayout() {
  const user = useLoaderData<typeof loader>()
  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4">
      <div className="flex items-center space-x-2 py-2">
        <Avatar size="lg" name={`${user.firstName} ${user.lastName}`} src={user.avatar} />
        <p>
          {user.firstName} {user.lastName}
        </p>
      </div>
      <div className="flex gap-10">
        <div className="w-[350px]">
          <ProfileLink to="/profile" Icon={User} end>
            Profile
          </ProfileLink>
          <ProfileLink Icon={Truck} to="/profile/van">
            My van
          </ProfileLink>
          <ProfileLink Icon={Settings} to="/profile/settings">
            Settings
          </ProfileLink>
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function ProfileLink({ Icon, children, ...props }: NavLinkProps & { Icon: LucideIcon; children: React.ReactNode }) {
  return (
    <NavLink
      {...props}
      to={props.to}
      className={({ isActive }) =>
        join(
          `flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-600`,
          isActive && "bg-gray-50 dark:bg-gray-700",
        )
      }
    >
      {<Icon className="sq-4 opacity-60" />}
      <span>{children}</span>
    </NavLink>
  )
}
