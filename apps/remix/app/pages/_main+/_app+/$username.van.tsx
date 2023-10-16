import { useLoaderData } from "@remix-run/react"
import type { LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { cacheHeader } from "pretty-cache-header"

import { createImageUrl } from "@ramble/shared"

import { OptimizedImage } from "~/components/OptimisedImage"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { notFound } from "~/lib/remix.server"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const user = await db.user.findUnique({ where: { username: params.username }, include: { van: { include: { images: true } } } })
  if (!user) throw notFound()
  return json(user, {
    headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }) },
  })
}

export default function ProfileVan() {
  const user = useLoaderData<typeof loader>()

  return (
    <div>
      {user.van ? (
        <div className="space-y-2">
          <div>
            <h2 className="text-xl">{user.van.name}</h2>
            <p>
              {user.van.model} · {user.van.year}
            </p>
            <p>{user.van.description}</p>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {user.van.images.map((image) => (
              <OptimizedImage
                key={image.id}
                alt="van"
                placeholder={image.blurHash}
                src={createImageUrl(image.path)}
                width={500}
                height={350}
                className="rounded-xs object-cover"
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
