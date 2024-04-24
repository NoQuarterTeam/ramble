import { LinkButton } from "@/components/LinkButton"
import { ArrowLeft } from "lucide-react"

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-2 md:p-6 mb-40">
      <div className="mx-auto max-w-2xl space-y-6">
        <LinkButton size="sm" leftIcon={<ArrowLeft size={14} />} aria-label="Back to home" variant="outline" href="/blog">
          Back
        </LinkButton>
        {children}
      </div>
    </div>
  )
}
