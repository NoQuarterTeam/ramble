import * as React from "react"
import { Link, useFetcher, useLoaderData } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"

import { createImageUrl } from "@ramble/shared"

import { OptimizedImage } from "~/components/OptimisedImage"
import { PageContainer } from "~/components/PageContainer"
import { Avatar, Badge, Button, Icons } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import type { LoaderFunctionArgs, SerializeFrom } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import dayjs from "dayjs"

export const config = {
  // runtime: "edge",
  // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export const headers = useLoaderHeaders

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams
  const skip = parseInt((searchParams.get("skip") as string) || "0")

  const vans = await db.van.findMany({
    take: 16,
    skip,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      model: true,
      year: true,
      images: { take: 1, orderBy: { createdAt: "desc" } },
      user: { select: { id: true, username: true, avatar: true, avatarBlurHash: true } },
    },
  })

  const count = await db.van.count()

  return json(
    { vans, count },
    {
      headers: {
        "Cache-Control": cacheHeader({ public: true, sMaxage: "1hour", staleWhileRevalidate: "1min", maxAge: "1hour" }),
      },
    },
  )
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vans.map((van) => (
          <VanItem key={van.id} van={van} />
        ))}
      </div>
      {count > vans.length && (
        <div className="center mt-6">
          <Button size="lg" isLoading={vanFetcher.state === "loading"} variant="outline" onClick={onNext}>
            Load more
          </Button>
        </div>
      )}
    </PageContainer>
  )
}

function VanItem(props: { van: SerializeFrom<LoaderData>["vans"][number] }) {
  return (
    <Link
      to={`/${props.van.user.username}/van`}
      className="rounded-xs space-y-2 overflow-hidden border transition-colors hover:opacity-75"
    >
      <div className="relative h-[200px]">
        {props.van.images[0] ? (
          <OptimizedImage
            alt="van"
            width={300}
            height={200}
            className="h-full object-contain"
            src={createImageUrl(props.van.images[0].path)}
            placeholder={props.van.images[0].blurHash}
          />
        ) : (
          <div className="center h-full bg-gray-50 dark:bg-gray-800">
            <Icons.Van size={60} className="opacity-70" strokeWidth={1} />
          </div>
        )}
        {dayjs(props.van.createdAt).isAfter(dayjs().subtract(3, "days")) && (
          <Badge size="sm" colorScheme="green" className="absolute right-2 top-2 bg-green-100 text-xs dark:bg-green-900">
            New
          </Badge>
        )}
      </div>
      <div className="space-y-2 p-2">
        <div>
          <p className="text-2xl leading-5">{props.van.name}</p>
          <p>
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
