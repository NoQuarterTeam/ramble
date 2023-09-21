import { createImageUrl } from "@ramble/shared"
import { Link, useFetcher, useLoaderData } from "@remix-run/react"
import type { LoaderArgs, SerializeFrom } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import * as React from "react"
import { OptimizedImage } from "~/components/OptimisedImage"

import { PageContainer } from "~/components/PageContainer"
import { Avatar, Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"

export const config = {
  runtime: "edge",
  regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export const headers = useLoaderHeaders

export const loader = async ({ request }: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams
  const skip = parseInt((searchParams.get("skip") as string) || "0")

  const vans = await db.van.findMany({
    take: 12,
    skip,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      model: true,
      year: true,
      images: { take: 1, orderBy: { createdAt: "desc" } },
      user: { select: { id: true, username: true, avatar: true, avatarBlurHash: true } },
    },
  })

  const count = await db.van.count()

  return json({ vans, count }, { headers: { "Cache-Control": cacheHeader({ public: true, sMaxage: "1hour", maxAge: "1hour" }) } })
}

type LoaderData = typeof loader

export default function Vans() {
  const { vans: initialVans, count } = useLoaderData<LoaderData>()

  const vanFetcher = useFetcher<LoaderData>()
  const [vans, setVans] = React.useState(initialVans)

  const onNext = () => vanFetcher.load(`/vans?skip=${vans.length}`)

  React.useEffect(() => {
    if (vanFetcher.state === "loading") return
    const data = vanFetcher.data?.vans
    if (data) setVans((prev) => [...prev, ...data])
  }, [vanFetcher.data, vanFetcher.state])

  return (
    <PageContainer className="space-y-2">
      <h1 className="text-3xl">Latest vans</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vans.map((van) => (
          <VanItem key={van.id} van={van} />
        ))}
      </div>
      {count > vans.length && (
        <div className="center">
          <Button size="lg" isLoading={vanFetcher.state === "loading"} variant="outline" onClick={onNext}>
            Load more
          </Button>
        </div>
      )}
    </PageContainer>
  )
}

function VanItem(props: { van: SerializeFrom<typeof loader>["vans"][number] }) {
  return (
    <Link
      to={`/${props.van.user.username}/van`}
      className="rounded-xs space-y-2 overflow-hidden border transition-colors hover:opacity-75"
    >
      <OptimizedImage
        alt="van"
        width={400}
        height={300}
        src={createImageUrl(props.van.images[0]?.path)}
        placeholder={props.van.images[0]?.blurHash}
      />
      <div className="space-y-4 p-2">
        <div>
          <p className="text-2xl leading-5">{props.van.name}</p>
          <p className="text-sm">
            {props.van.model} · {props.van.year}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Avatar
            size={40}
            className="sq-10"
            src={createImageUrl(props.van.user.avatar)}
            placeholder={props.van.user.avatarBlurHash}
          />
          <p>{props.van.user.username}</p>
        </div>
      </div>
    </Link>
  )
}
