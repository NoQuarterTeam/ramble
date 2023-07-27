import { LinkButton } from "~/components/LinkButton"

export const config = {
  runtime: "edge",
  regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export async function loader() {
  throw new Response("Not found", { status: 404 })
}

export default function NotFound() {
  // due to the loader, this component will never be rendered, but we'll return
  // the error boundary just in case.
  return <ErrorBoundary />
}

export function ErrorBoundary() {
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
