import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"

import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request)
  return json(user)
}

export const action = async ({ request }: ActionArgs) => {
  //
}

export default function ProfileSettings() {
  return <div>stuff</div>
}
