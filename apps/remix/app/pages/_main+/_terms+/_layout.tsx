import { Outlet } from "@remix-run/react"

import { PageContainer } from "~/components/PageContainer"

export default function Layout() {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  )
}
