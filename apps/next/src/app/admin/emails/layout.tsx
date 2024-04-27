import { MoveRight } from "lucide-react"
import Link from "next/link"
import type * as React from "react"

const templates = ["reset-password", "verify-account", "guide-request", "access-request", "beta-invitation"]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="w-[240px] h-nav-screen space-y-4 border-r p-4">
        {templates.map((href) => (
          <Link
            className="flex items-center hover:underline space-x-2 whitespace-nowrap"
            key={href}
            href={`/admin/emails/${href}`}
          >
            <span>{href}</span>
            <MoveRight size={16} />
          </Link>
        ))}
      </div>
      <div className="w-full overflow-y-auto">
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
