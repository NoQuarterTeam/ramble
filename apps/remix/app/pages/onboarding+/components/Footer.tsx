import type * as React from "react"

export default function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-gray-75 fixed bottom-0 left-0 w-full border-t bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">{children}</div>
    </div>
  )
}
