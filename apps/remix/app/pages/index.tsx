import { json, redirect } from "~/lib/remix.server"
import Home from "./home"
import { LoaderArgs } from "@remix-run/node"
import { getMaybeUser } from "~/services/auth/auth.server"

export const config = {
  runtime: "edge",
}

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getMaybeUser(request)
  if (user) return redirect("/map")
  return json(null)
}

export default Home
