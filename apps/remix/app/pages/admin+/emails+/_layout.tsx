import path from "path"
import fs from "fs"
import { merge } from "@ramble/shared"
import { NavLink, NavLinkProps, Outlet, useLoaderData } from "@remix-run/react"
import { LoaderFunctionArgs } from "@vercel/remix"
import { MoveRight } from "lucide-react"

import { buttonStyles, buttonSizeStyles } from "~/components/ui"
import { json } from "~/lib/remix.server"

import { getCurrentAdmin } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await getCurrentAdmin(request)
  const filePath = path.join(process.cwd(), "../../packages/emails/src/templates")
  const templates = (await fs.promises.readdir(filePath)).map((file) => file.split(".tsx")[0] || file)
  return json(templates)
}

export default function Layout() {
  const templates = useLoaderData<typeof loader>()
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
        <div className="py-4">
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
