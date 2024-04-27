import { requireAdmin } from "@/lib/server/auth"
import type * as React from "react"
import { AdminSidebar } from "./AdminSidebar"

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="w-full h-nav-screen overflow-y-auto pl-[50px] md:pl-[200px]">
        <div>{children}</div>
      </div>
    </div>
  )
}
