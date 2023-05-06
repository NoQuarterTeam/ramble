import type * as React from "react"

import { Nav } from "~/components/Nav"

export default function AppLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {props.children}
    </>
  )
}
