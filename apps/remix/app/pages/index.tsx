import { type LoaderFunctionArgs, redirect } from "@remix-run/node"

import { json } from "~/lib/remix.server"
import { getMaybeUser } from "~/services/auth/auth.server"

import { honeypot } from "~/services/honeypot.server"
import Home from "./home"

export const config = {
  // runtime: "edge",
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getMaybeUser(request)
  if (user) return redirect("/map")

  return json({ honeypotInputProps: honeypot.getInputProps() })
}

export default Home
