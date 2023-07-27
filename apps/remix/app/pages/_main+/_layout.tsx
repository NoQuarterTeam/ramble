import { Outlet } from "@remix-run/react"

import { Nav } from "./_app+/components/Nav"

export default function MainLayout() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  )
}
