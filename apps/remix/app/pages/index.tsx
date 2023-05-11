import { json, type LoaderArgs, redirect } from "@vercel/remix"
import { LinkButton } from "~/components/LinkButton"

import { getMaybeUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getMaybeUser(request)

  if (user) redirect("/map")
  return json(null)
}

export default function Home() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <LinkButton size="lg" to="map">
        Go to Map
      </LinkButton>
      <h1 className="bg-gradient-to-br from-green-400 to-cyan-600 bg-clip-text p-4 text-center text-8xl text-transparent">
        Coming soon
      </h1>
    </div>
  )
}
