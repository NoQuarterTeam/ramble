import type { NavLinkProps } from "@remix-run/react"
import { Link, NavLink, Outlet } from "@remix-run/react"
import { Flag, GaugeCircle, HelpingHand, Mail, MapPin, MessageCircle, Moon, Sun, User } from "lucide-react"

import { merge } from "@ramble/shared"

import { useFetcher } from "~/components/Form"
import { type RambleIcon } from "~/components/ui"
import { buttonSizeStyles, buttonStyles } from "~/components/ui/Button"
import { useTheme } from "~/lib/theme"
import { json, type LoaderFunctionArgs, redirect } from "~/lib/vendor/vercel.server"
import { getCurrentUser } from "~/services/auth/auth.server"

export const shouldRevalidate = () => false

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, { isAdmin: true })
  if (!user.isAdmin) return redirect("/")
  return json(null)
}

export default function AdminLayout() {
  const themeFetcher = useFetcher()
  const isDark = useTheme() === "dark"
  return (
    <div className="flex">
      <div className="bg-background fixed left-0 top-0 flex h-screen w-[50px] flex-col justify-between border-r px-0 pb-10 md:w-[200px] md:px-4">
        <div className="flex flex-col space-y-2 py-8">
          <Link to="/" className="brand-header w-full pl-0 text-center text-lg md:pl-3 md:text-left">
            <span className="hidden md:block">ramble</span>
            <span className="block md:hidden">r</span>
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
          <AdminLink Icon={Flag} to="spot-reports">
            Spot reports
          </AdminLink>
          <AdminLink Icon={HelpingHand} to="access-requests">
            Access requests
          </AdminLink>
          <AdminLink Icon={MessageCircle} to="feedback">
            Feedback
          </AdminLink>
        </div>
        <div className="space-y-2">
          <AdminLink Icon={Mail} to="emails">
            Emails
          </AdminLink>
          <themeFetcher.Form action="/api/theme" className="w-full">
            <input type="hidden" name="theme" value={isDark ? "light" : "dark"} />
            <themeFetcher.FormButton variant="ghost" className="w-full justify-center space-x-2 md:justify-start">
              {isDark ? <Sun className="sq-4" /> : <Moon className="sq-4" />}
              <span className="hidden md:block">{isDark ? "Light" : "Dark"} mode</span>
            </themeFetcher.FormButton>
          </themeFetcher.Form>
        </div>
      </div>
      <div className="w-full pl-[50px] md:pl-[200px]">
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
        merge(
          buttonStyles({ variant: isActive ? "secondary" : "ghost" }),
          buttonSizeStyles(),
          "w-full justify-center space-x-2 md:justify-start",
        )
      }
    >
      <Icon size={16} />
      <p className="hidden md:block">{children}</p>
    </NavLink>
  )
}
