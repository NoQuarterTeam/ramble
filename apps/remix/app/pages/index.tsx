import { json, LoaderArgs, redirect } from "@vercel/remix"
import { getMaybeUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getMaybeUser(request)

  if (user) redirect("/map")
  return json(null)
}

export default function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <h1 className="bg-gradient-to-br from-green-400 to-cyan-600 bg-clip-text p-4 text-center text-8xl text-transparent">
        Coming soon
      </h1>
    </div>
  )
}
