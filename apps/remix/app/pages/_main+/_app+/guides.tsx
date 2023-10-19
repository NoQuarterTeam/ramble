import * as React from "react"
import { Link, useFetcher, useLoaderData } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"
import { promiseHash } from "remix-utils/promise"

import { createImageUrl } from "@ramble/shared"

import { PageContainer } from "~/components/PageContainer"
import { Avatar, Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { json } from "~/lib/remix.server"
import type { LoaderFunctionArgs, SerializeFrom } from "~/lib/vendor/vercel.server"
import { GuideRequestForm } from "~/pages/api+/guide-request"

export const config = {
  // runtime: "edge",
  // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export const headers = useLoaderHeaders

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams
  const skip = parseInt((searchParams.get("skip") as string) || "0")

  const data = await promiseHash({
    guides: db.user.findMany({
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
        _count: {
          select: {
            followers: true,
            lists: { where: { isPrivate: false } },
            verifiedSpots: { where: { sourceUrl: { equals: null }, deletedAt: null } },
          },
        },
      },
    }),
    count: db.user.count({ where: { role: "GUIDE" } }),
  })

  return json(data, request, {
    headers: { "Cache-Control": cacheHeader({ public: true, sMaxage: "1hour", staleWhileRevalidate: "1min", maxAge: "1hour" }) },
  })
}

type LoaderData = typeof loader

export default function Guides() {
  const { guides: initialGuides, count } = useLoaderData<LoaderData>()

  const user = useMaybeUser()
  const guideFetcher = useFetcher<LoaderData>()
  const [guides, setGuides] = React.useState(initialGuides)

  const onNext = () => guideFetcher.load(`/guides?skip=${guides.length}`)

  React.useEffect(() => {
    if (guideFetcher.state === "loading") return
    const data = guideFetcher.data?.guides
    if (data) setGuides((prev) => [...prev, ...data])
  }, [guideFetcher.data, guideFetcher.state])

  return (
    <PageContainer className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl">Guides</h1>
          <p>Fellow van life travellers that have been handpicked to guarantee beautiful and authentic spots</p>
        </div>
        {user && user.role === "MEMBER" && !user.isPendingGuideApproval && <GuideRequestForm />}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <GuideItem key={guide.id} guide={guide} />
        ))}
      </div>
      {count > guides.length && (
        <div className="center">
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
    <Link to={`/${props.guide.username}`} className="border-hover rounded-xs flex flex-col gap-6 border p-4 transition-colors">
      <div className="flex items-center space-x-2">
        <Avatar
          className="sq-20 flex-shrink-0"
          size={100}
          placeholder={props.guide.avatarBlurHash}
          src={createImageUrl(props.guide.avatar)}
        />
        <div>
          <p className="text-lg leading-3 md:text-xl lg:text-2xl">
            {props.guide.firstName} {props.guide.lastName}
          </p>
          <p>{props.guide.username}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center text-sm">
          <p className="text-xl font-semibold leading-tight">{props.guide._count?.verifiedSpots.toLocaleString()}</p>
          <p>spots</p>
        </div>
        <div className="text-center text-sm">
          <p className="text-xl font-semibold leading-tight">{props.guide._count?.followers.toLocaleString()}</p>
          <p>followers</p>
        </div>
        <div className="text-center text-sm">
          <p className="text-xl font-semibold leading-tight">{props.guide._count?.lists.toLocaleString()}</p>
          <p>lists</p>
        </div>
      </div>
    </Link>
  )
}
