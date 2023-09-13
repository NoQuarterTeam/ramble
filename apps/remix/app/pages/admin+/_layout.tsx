import type { NavLinkProps } from "@remix-run/react"
import { Link, NavLink, Outlet, useFetcher } from "@remix-run/react"
import { json, type LoaderArgs, redirect } from "@vercel/remix"

import { merge } from "@ramble/shared"

import { Button, buttonSizeStyles, buttonStyles } from "~/components/ui/Button"
import { getCurrentUser } from "~/services/auth/auth.server"
import { useTheme } from "~/lib/theme"
import { Sun, Moon } from "lucide-react"

export const shouldRevalidate = () => false

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request)
  if (!user.isAdmin) return redirect("/")
  return json(null)
}

export default function AdminLayout() {
  const themeFetcher = useFetcher()
  const isDark = useTheme() === "dark"
  return (
    <div className="flex">
      <div className="flex h-screen flex-col justify-between pb-10">
        <div className="flex flex-col space-y-2 px-4 py-8">
          <div className="pl-3">
            <Link to="/" className="brand-header text-lg">
              ramble
            </Link>
          </div>
          <AdminLink end to="/admin">
            Dashboard
          </AdminLink>
          <AdminLink to="users">Users</AdminLink>
          <AdminLink to="spots">Spots</AdminLink>
        </div>
        <themeFetcher.Form action="/api/theme" method="post" replace className="center w-full">
          <input type="hidden" name="theme" value={isDark ? "light" : "dark"} />
          <Button variant="ghost" type="submit" leftIcon={isDark ? <Sun className="sq-4" /> : <Moon className="sq-4" />}>
            <span>{isDark ? "Light" : "Dark"} mode</span>
          </Button>
        </themeFetcher.Form>
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
        merge(buttonStyles({ variant: isActive ? "secondary" : "ghost" }), buttonSizeStyles(), "min-w-[150px] justify-start")
      }
    >
      {children}
    </NavLink>
  )
}
