import type { LoaderArgs, ActionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, { van: { select: { id: true, name: true } } })
  return json(user)
}

export const action = async ({ request }: ActionArgs) => {
  //
}

export default function VanProfile() {
  const user = useLoaderData<typeof loader>()

  return <div>{user.van?.name}</div>
}
