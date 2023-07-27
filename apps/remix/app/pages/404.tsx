import { LinkButton } from "~/components/LinkButton"

export default function NotFound() {
  return (
    <div className="flex items-center overflow-scroll p-20 pt-40">
      <div className="stack space-y-6">
        <div className="stack">
          <h1 className="text-9xl">404</h1>
          <p className="text-lg">The page you're looking for doesn't exist</p>
        </div>
        <LinkButton to="/">Take me home</LinkButton>
      </div>
    </div>
  )
}
