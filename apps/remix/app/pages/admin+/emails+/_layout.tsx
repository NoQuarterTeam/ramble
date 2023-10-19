import { NavLink, type NavLinkProps, Outlet, useMatches } from "@remix-run/react"
import { MoveRight } from "lucide-react"

import { merge } from "@ramble/shared"

import { Form, FormButton } from "~/components/Form"
import { buttonSizeStyles, buttonStyles } from "~/components/ui"

const templates = ["reset-password", "verify-account", "feedback-sent", "guide-request", "access-request", "beta-invitation"]

export type TemplateHandle = { url: string } | undefined

export default function Layout() {
  const matches = useMatches()
  const sendTemplateUrl = matches.filter((match) => !!(match.handle as TemplateHandle)?.url)[0]?.handle as TemplateHandle
  return (
    <div className="flex">
      <div className="h-screen w-[220px] space-y-2 border-r p-4">
        {templates.map((template) => (
          <AdminLink key={template} to={template}>
            {template}
          </AdminLink>
        ))}
      </div>
      <div className="w-full">
        {sendTemplateUrl && (
          <div className="bg-background flex justify-end border-b p-4">
            <Form action={sendTemplateUrl?.url}>
              <FormButton>Send test email</FormButton>
            </Form>
          </div>
        )}
        <div className="px-2 py-4">
          <Outlet />
        </div>
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
