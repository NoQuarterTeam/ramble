import { useLoaderData } from "@remix-run/react"
import { createColumnHelper } from "@tanstack/react-table"
import { type LoaderArgs, type SerializeFrom } from "@vercel/remix"
import dayjs from "dayjs"
import { promiseHash } from "remix-utils"

import { type Prisma } from "@ramble/database/types"

import { Search } from "~/components/Search"
import { Table } from "~/components/Table"

import { db } from "~/lib/db.server"
import { json } from "~/lib/remix.server"
import { getTableParams } from "~/lib/table"

export const loader = async ({ request }: LoaderArgs) => {
  const { orderBy, search, skip, take } = getTableParams(request)
  const where = {
    OR: search
      ? [{ email: { contains: search } }, { firstName: { contains: search } }, { lastName: { contains: search } }]
      : undefined,
  } satisfies Prisma.UserWhereInput

  const data = await promiseHash({
    accessRequests: db.accessRequest.findMany({ orderBy, skip, take, where }),
    count: db.accessRequest.count({ where }),
  })
  return json(data)
}

type InviteRequest = SerializeFrom<typeof loader>["accessRequests"][number]

const columnHelper = createColumnHelper<InviteRequest>()
const columns = [
  columnHelper.accessor("email", {
    id: "email",
    header: () => "Email",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: () => "Created",
    cell: (info) => dayjs(info.getValue()).format("DD/MM/YYYY"),
  }),
]
export default function InviteRequests() {
  const { accessRequests, count } = useLoaderData<typeof loader>()
  return (
    <div className="space-y-2">
      <h1 className="text-4xl">Invite Requests</h1>
      <div className="flex gap-2">
        <div>
          <Search className="max-w-[400px]" />
        </div>
      </div>
      <Table data={accessRequests} count={count} columns={columns} />
    </div>
  )
}
