import type { NavLinkProps } from "@remix-run/react"
import { NavLink, Outlet } from "@remix-run/react"
import { json, type LoaderArgs, redirect } from "@vercel/remix"

import { join } from "@ramble/shared"

import { getCurrentUser } from "~/services/auth/auth.server"
import { buttonSizeStyles, buttonStyles } from "~/components/ui/Button"
import { Icons } from "~/components/ui"

export const shouldRevalidate = () => false

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request)
  if (!user.isAdmin) return redirect("/")
  return json(null)
}

export default function AdminLayout() {
  return (
    <div className="flex">
      <div className="flex flex-col space-y-2 px-4 py-8">
        <div className="pl-3">
          <Icons.Van />
        </div>
        <AdminLink end to="/admin">
          Admin
        </AdminLink>
        <AdminLink to="users">Users</AdminLink>
        <AdminLink to="spots">Spots</AdminLink>
      </div>
      <div className="w-full px-4 py-8">
        <Outlet />
      </div>
    </div>
  )
}

function AdminLink({ to, children, ...props }: NavLinkProps) {
  return (
    <NavLink
      {...props}
      to={to}
      className={({ isActive }) =>
        join(buttonStyles({ variant: isActive ? "secondary" : "ghost" }), buttonSizeStyles(), "min-w-[150px] justify-start")
      }
    >
      {children}
    </NavLink>
  )
}
