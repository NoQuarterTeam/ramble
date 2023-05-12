import { createImageUrl } from "@ramble/shared"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getCurrentUser(request, {
    van: { select: { id: true, name: true, images: { select: { path: true, id: true } } } },
  })
  return json(user)
}

export const action = async ({ request }: ActionArgs) => {
  //
}

export default function VanProfile() {
  const user = useLoaderData<typeof loader>()

  return (
    <div>
      <p className="text-lg">{user.van?.name}</p>
      {user.van?.images?.map((image) => (
        <img alt="van" key={image.id} src={createImageUrl(image.path)} width={300} height={200} className="object-cover" />
      ))}
    </div>
  )
}
