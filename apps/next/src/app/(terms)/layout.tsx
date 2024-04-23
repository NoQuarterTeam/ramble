import { PageContainer } from "@/components/PageContainer"
import type * as React from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PageContainer>{children}</PageContainer>
}
