import { json, type LoaderArgs, redirect } from "@vercel/remix"

import { LinkButton } from "~/components/LinkButton"
import { OptimizedImage } from "~/components/OptimisedImage"
import { getMaybeUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getMaybeUser(request)

  if (user) redirect("/map")
  return json(null)
}

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl p-4 py-8">
      <div className="flex gap-10 py-32">
        <div className="space-y-2">
          <h1 className="text-4xl font-medium">Everything you need for travelling Europe</h1>
          <p className="text-2xl">1000's of spots, service stations, cafes, parks and more</p>
          <LinkButton size="lg" to="map" className="max-w-min">
            Start exploring
          </LinkButton>
        </div>
        <div>
          <OptimizedImage src="/hero.jpg" width={400} height={400} alt="two vans in the forest" className="rounded" />
        </div>
      </div>
    </div>
  )
}
