import { LinkButton } from "@/components/LinkButton"

export default function Page() {
  return (
    <div className="flex items-center space-y-6 flex-col justify-center h-nav-screen">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-lg">Page not found</p>
      <LinkButton href="/">Go back</LinkButton>
    </div>
  )
}
