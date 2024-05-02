import { AppCta } from "@/components/AppCta"
import { LinkButton } from "@/components/LinkButton"
import { ArrowLeft } from "lucide-react"
import type * as React from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <LinkButton size="sm" leftIcon={<ArrowLeft size={14} />} aria-label="Back to home" variant="outline" href="/blog">
          Back
        </LinkButton>
        {children}
        <div className="py-20">
          <AppCta message="Download the app now and explore!" />
        </div>
      </div>
    </div>
  )
}
