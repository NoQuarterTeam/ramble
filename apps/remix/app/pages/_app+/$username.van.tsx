import { createImageUrl } from "@ramble/shared"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"

import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound } from "~/lib/remix.server"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const user = await db.user.findFirst({
    where: { isProfilePublic: { equals: true }, username: params.username },
    include: { van: { include: { images: true } } },
  })
  if (!user) throw notFound(null)
  return json(user)
}

export default function ProfileLists() {
  const user = useLoaderData<typeof loader>()

  return (
    <div>
      {user.van ? (
        <div className="space-y-2">
          <div>
            <h3 className="text-xl">{user.van.name}</h3>
            <p>
              {user.van.model} · {user.van.year}
            </p>
            <p>{user.van.description}</p>
          </div>
          <div className="flex space-x-2">
            {user.van.images.map((image) => (
              <img
                key={image.id}
                alt="van"
                src={createImageUrl(image.path)}
                width={300}
                height={200}
                className="rounded-md object-contain"
              />
            ))}
          </div>
        </div>
      ) : (
        <p>No van yet</p>
      )}
    </div>
  )
}
