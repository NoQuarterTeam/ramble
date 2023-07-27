import * as React from "react"
import { Link, useFetcher, useLoaderData } from "@remix-run/react"
import type { LoaderArgs, SerializeFrom } from "@vercel/remix"
import { json } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"

import { createImageUrl } from "@ramble/shared"

import { PageContainer } from "~/components/PageContainer"
import { Avatar, Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"

export const headers = useLoaderHeaders

export const loader = async ({ request }: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams
  const skip = parseInt((searchParams.get("skip") as string) || "0")

  const guides = await db.user.findMany({
    where: { role: "GUIDE" },
    take: 12,
    skip,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
      avatarBlurHash: true,
      _count: { select: { createdSpots: true } },
    },
  })

  const count = await db.user.count({ where: { role: "GUIDE" } })

  return json(
    { guides, count },
    { headers: { "Cache-Control": cacheHeader({ public: true, sMaxage: "1hour", maxAge: "1hour" }) } },
  )
}

type LoaderData = typeof loader

export default function Guides() {
  const { guides: initialGuides, count } = useLoaderData<LoaderData>()

  const guideFetcher = useFetcher<LoaderData>()
  const [guides, setGuides] = React.useState(initialGuides)

  const onNext = () => guideFetcher.load(`/guides?skip=${guides.length}`)

  React.useEffect(() => {
    if (guideFetcher.state === "loading") return
    const data = guideFetcher.data?.guides
    if (data) setGuides((prev) => [...prev, ...data])
  }, [guideFetcher.data, guideFetcher.state])

  return (
    <PageContainer className="space-y-2">
      <h1 className="text-3xl">Latest guides</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {guides.map((guide) => (
          <GuideItem key={guide.id} guide={guide} />
        ))}
      </div>
      {count > 10 && (
        <div className="flex items-center justify-center">
          <Button size="lg" isLoading={guideFetcher.state === "loading"} variant="outline" onClick={onNext}>
            Load more
          </Button>
        </div>
      )}
    </PageContainer>
  )
}

function GuideItem(props: { guide: SerializeFrom<typeof loader>["guides"][number] }) {
  return (
    <Link
      to={`/${props.guide.username}`}
      className="flex items-center justify-between space-x-4 rounded-md border border-gray-200 p-4 transition-colors hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
    >
      <div className="flex items-center space-x-2">
        <Avatar className="sq-20" size={100} placeholder={props.guide.avatarBlurHash} src={createImageUrl(props.guide.avatar)} />
        <div>
          <p className="text-2xl leading-5">
            {props.guide.firstName} {props.guide.lastName}
          </p>
          <p className="text-sm">{props.guide.username}</p>
        </div>
      </div>
      <div className="text-center text-sm">
        <p className="font-medium leading-tight">{props.guide._count?.createdSpots}</p>
        <p>spots</p>
      </div>
    </Link>
  )
}
