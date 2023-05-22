import type { NavLinkProps } from "@remix-run/react"
import { Outlet, useLoaderData } from "@remix-run/react"

import { Avatar } from "@ramble/ui"

import { createImageUrl, join } from "@ramble/shared"
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
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <div className="flex items-center space-x-2 py-2">
        <Avatar size="lg" name={`${user.firstName} ${user.lastName}`} src={createImageUrl(user.avatar)} />
        <p>
          {user.firstName} {user.lastName}
        </p>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:gap-10">
        <div className="flex w-auto flex-row space-x-2 overflow-scroll md:w-[350px] md:flex-col md:space-x-0">
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
          `md:text-md flex items-center space-x-1 rounded-md p-1 px-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 md:space-x-2 md:p-2`,
          isActive && "bg-gray-50 dark:bg-gray-700",
        )
      }
    >
      <Icon className="sq-4 opacity-60" />
      <span>{children}</span>
    </NavLink>
  )
}
