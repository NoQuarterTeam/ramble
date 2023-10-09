import { useLoaderData, useSearchParams } from "@remix-run/react"
import { createColumnHelper } from "@tanstack/react-table"
import { type LoaderFunctionArgs, type SerializeFrom } from "@vercel/remix"
import dayjs from "dayjs"
import queryString from "query-string"
import { promiseHash } from "remix-utils/promise"

import { type FeedbackType, type Prisma } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { Search } from "~/components/Search"
import { Table } from "~/components/Table"
import { Avatar, Select } from "~/components/ui"
import { db } from "~/lib/db.server"
import { FeedbackIcon, FEEDBACKS } from "~/lib/models/feedback"
import { json } from "~/lib/remix.server"
import { getTableParams } from "~/lib/table"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { orderBy, search, skip, take } = getTableParams(request)
  const searchParams = new URL(request.url).searchParams
  const type = (searchParams.get("type") as FeedbackType) || undefined
  const where = {
    OR: search ? [{ message: { contains: search } }] : undefined,
    type: type ? { equals: type } : undefined,
  } satisfies Prisma.FeedbackWhereInput

  const data = await promiseHash({
    feedbacks: db.feedback.findMany({ orderBy, skip, take, where, include: { user: true } }),
    count: db.feedback.count({ where }),
  })
  return json(data)
}

type Feedback = SerializeFrom<typeof loader>["feedbacks"][number]

const columnHelper = createColumnHelper<Feedback>()
const columns = [
  columnHelper.accessor("message", {
    id: "message",
    header: () => "Message",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("type", {
    id: "type",
    header: () => "Type",
    cell: (info) => (
      <div className="hstack">
        <span>
          <FeedbackIcon size={18} type={info.getValue()} />
        </span>
        <p>{FEEDBACKS[info.getValue()].label}</p>
      </div>
    ),
  }),
  columnHelper.accessor((row) => row.user, {
    id: "user.firstName",
    size: 120,
    cell: (info) => (
      <div className="flex items-center space-x-2">
        <Avatar
          className="sq-8"
          src={createImageUrl(info.getValue().avatar)}
          placeholder={info.getValue().avatarBlurHash}
          size={40}
        />
        <p>{info.getValue().firstName}</p>
      </div>
    ),
    header: () => "User",
  }),
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: () => "Created",
    cell: (info) => dayjs(info.getValue()).format("DD/MM/YYYY"),
  }),
]
export default function Feedbacks() {
  const { feedbacks, count } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  return (
    <div className="space-y-2">
      <h1 className="text-4xl">Feedback</h1>
      <div className="flex items-end gap-2">
        <div>
          <Search className="max-w-[400px]" />
        </div>
        <div>
          <p className="text-sm font-medium">Type</p>
          <Select
            defaultValue={searchParams.get("type") || ""}
            onChange={(e) => {
              const existingParams = queryString.parse(searchParams.toString())
              setSearchParams(queryString.stringify({ ...existingParams, type: e.target.value }))
            }}
            className="w-[100px]"
            name="type"
          >
            <option value="">All</option>
            <option value="ISSUE">Issue</option>
            <option value="IDEA">Idea</option>
            <option value="Other">Other</option>
          </Select>
        </div>
      </div>
      <Table data={feedbacks} count={count} columns={columns} />
    </div>
  )
}
