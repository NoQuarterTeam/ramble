import { Outlet } from "@remix-run/react"

import { PageContainer } from "~/components/PageContainer"

export default function ListDetail() {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  )
}
