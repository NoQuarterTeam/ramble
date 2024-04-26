import type * as React from "react"

import { requireAdmin } from "@/lib/server/auth"
import { AdminSidebar } from "./components/AdminSidebar"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="w-full h-nav-screen overflow-y-auto pl-[50px] md:pl-[200px]">
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
