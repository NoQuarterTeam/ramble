import { Outlet } from "@remix-run/react"

export default function AdminMainLayout() {
  return (
    <div className="px-4 py-8">
      <Outlet />
    </div>
  )
}
