import type * as React from "react"

export function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background fixed bottom-0 left-0 w-full border-t border-gray-100 dark:border-gray-700">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">{children}</div>
    </div>
  )
}
