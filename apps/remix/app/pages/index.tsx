import { type LoaderArgs } from "@remix-run/node"

import { json, redirect } from "~/lib/remix.server"
import { getMaybeUser } from "~/services/auth/auth.server"

import Home from "./home"

export const config = {
  runtime: "edge",
}

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getMaybeUser(request)
  if (user) return redirect("/map")
  return json(null)
}

export default Home
