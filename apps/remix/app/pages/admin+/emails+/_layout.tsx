import { merge } from "@ramble/shared"
import { NavLink, NavLinkProps, Outlet } from "@remix-run/react"

import { MoveRight } from "lucide-react"

import { buttonStyles, buttonSizeStyles } from "~/components/ui"

const templates = ["reset-password", "verify-account", "feedback-sent", "guide-request"]

export default function Layout() {
  return (
    <div className="flex">
      <div className="h-screen w-[220px] space-y-2 border-r p-4">
        {templates.map((template) => (
          <AdminLink key={template} to={template}>
            {template}
          </AdminLink>
        ))}
      </div>
      <div className="w-full py-4">
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
