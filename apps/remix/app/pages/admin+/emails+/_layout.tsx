import { merge } from "@ramble/shared"
import { NavLink, NavLinkProps, Outlet } from "@remix-run/react"
import { LoaderFunctionArgs } from "@vercel/remix"
import { MoveRight } from "lucide-react"
import { buttonStyles, buttonSizeStyles } from "~/components/ui"
import { json } from "~/lib/remix.server"

import { getCurrentAdmin } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await getCurrentAdmin(request)
  return json(null)
}

export default function Layout() {
  return (
    <div className="flex gap-2">
      <div className="h-screen w-[220px] space-y-2 border-r p-4">
        <AdminLink to="reset-password">Reset password</AdminLink>
        <AdminLink to="verify-account">Verify account</AdminLink>
      </div>
      <div className="w-full">
        <Outlet />
      </div>
    </div>
  )
}

function AdminLink({ to, children, ...props }: NavLinkProps & { children: React.ReactNode }) {
  return (
    <NavLink
      {...props}
      to={to}
      className={({ isActive }) =>
        merge(buttonStyles({ variant: isActive ? "secondary" : "ghost" }), buttonSizeStyles(), "w-full justify-start space-x-2")
      }
    >
      <span>{children}</span>
      <MoveRight size={16} />
    </NavLink>
  )
}
