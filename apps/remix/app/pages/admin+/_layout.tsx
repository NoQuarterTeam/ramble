import { NavLink, Outlet } from "@remix-run/react"
import { json, type LoaderArgs, redirect } from "@vercel/remix"

import { join } from "@ramble/shared"

import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request)
  if (!user.isAdmin) return redirect("/")
  return json(null)
}

export default function AdminLayout() {
  return (
    <div className="flex">
      <div className="flex flex-col space-y-2 p-8">
        <NavLink end to="/admin" className={({ isActive }) => join("", isActive && "text-primary-500")}>
          Admin
        </NavLink>

        <NavLink to="users" className={({ isActive }) => join("", isActive && "text-primary-500")}>
          Users
        </NavLink>

        <NavLink to="spots" className={({ isActive }) => join("", isActive && "text-primary-500")}>
          Spots
        </NavLink>
      </div>
      <div className="w-full p-8">
        <Outlet />
      </div>
    </div>
  )
}
