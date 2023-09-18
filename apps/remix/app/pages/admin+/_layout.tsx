import type { NavLinkProps } from "@remix-run/react"
import { Link, NavLink, Outlet, useFetcher } from "@remix-run/react"
import { json, type LoaderArgs, redirect } from "@vercel/remix"
import { GaugeCircle, MapPin, Moon, Sun, User } from "lucide-react"

import { merge } from "@ramble/shared"

import { type RambleIcon } from "~/components/ui"
import { Button, buttonSizeStyles, buttonStyles } from "~/components/ui/Button"
import { useTheme } from "~/lib/theme"
import { getCurrentUser } from "~/services/auth/auth.server"

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
      <div className="fixed left-0 top-0 flex h-screen w-[200px] flex-col justify-between border-r px-4 pb-10">
        <div className="flex flex-col space-y-2 py-8">
          <Link to="/" className="brand-header pl-3 text-lg">
            ramble
          </Link>

          <AdminLink Icon={GaugeCircle} end to="/admin">
            Dashboard
          </AdminLink>
          <AdminLink Icon={User} to="users">
            Users
          </AdminLink>
          <AdminLink Icon={MapPin} to="spots">
            Spots
          </AdminLink>
        </div>
        <themeFetcher.Form action="/api/theme" method="post" replace className="w-full">
          <input type="hidden" name="theme" value={isDark ? "light" : "dark"} />
          <Button
            variant="ghost"
            className="w-full"
            type="submit"
            leftIcon={isDark ? <Sun className="sq-4" /> : <Moon className="sq-4" />}
          >
            <span>{isDark ? "Light" : "Dark"} mode</span>
          </Button>
        </themeFetcher.Form>
      </div>
      <div className="ml-[200px] w-full px-4 py-8">
        <Outlet />
      </div>
    </div>
  )
}

function AdminLink({ to, children, Icon, ...props }: NavLinkProps & { children: React.ReactNode; Icon: RambleIcon }) {
  return (
    <NavLink
      {...props}
      to={to}
      className={({ isActive }) =>
        merge(buttonStyles({ variant: isActive ? "secondary" : "ghost" }), buttonSizeStyles(), "w-full justify-start space-x-2")
      }
    >
      <Icon size={16} />
      <p>{children}</p>
    </NavLink>
  )
}
