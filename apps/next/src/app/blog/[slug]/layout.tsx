import { LinkButton } from "@/components/LinkButton"
import { ArrowLeft } from "lucide-react"

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 md:p-10">
      <LinkButton leftIcon={<ArrowLeft size={18} />} aria-label="Back to home" variant="outline" href="/blog">
        Back
      </LinkButton>

      <div className="mx-auto max-w-2xl pt-4 pb-52">{children}</div>
    </div>
  )
}
