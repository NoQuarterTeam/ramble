import type * as React from "react"

export function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-0 left-0 w-full border-t bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">{children}</div>
    </div>
  )
}
