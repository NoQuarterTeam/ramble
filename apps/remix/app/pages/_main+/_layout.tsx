import { Outlet } from "@remix-run/react"

import { Nav } from "./components/Nav"

export default function MainLayout() {
  return (
    <>
      <Nav />
      <div className="pt-nav">
        <Outlet />
      </div>
    </>
  )
}
