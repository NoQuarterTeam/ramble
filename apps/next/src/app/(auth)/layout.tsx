import type * as React from "react"

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center flex-col pt-10">
      <div className="w-full max-w-md space-y-8 bg-background p-4">{children}</div>
    </div>
  )
}
