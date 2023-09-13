import { useLoaderData } from "@remix-run/react"
import { createColumnHelper } from "@tanstack/react-table"
import { type LoaderArgs, type SerializeFrom } from "@vercel/remix"
import dayjs from "dayjs"

import { type Prisma } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { Search } from "~/components/Search"
import { Table } from "~/components/Table"
import { Avatar } from "~/components/ui"
import { db } from "~/lib/db.server"

import { json } from "~/lib/remix.server"
import { getTableParams } from "~/lib/table"
import { promiseHash } from "remix-utils"

export const loader = async ({ request }: LoaderArgs) => {
  const { orderBy, search, skip, take } = getTableParams(request)
  const where = {
    OR: search
      ? [{ email: { contains: search } }, { firstName: { contains: search } }, { lastName: { contains: search } }]
      : undefined,
  } satisfies Prisma.UserWhereInput

  const data = await promiseHash({
    users: db.user.findMany({ orderBy, skip, take, where }),
    count: db.user.count({ where }),
  })
  return json(data)
}

type User = SerializeFrom<typeof loader>["users"][number]

const columnHelper = createColumnHelper<User>()
const columns = [
  columnHelper.accessor("firstName", {
    id: "firstName",
    header: () => "First name",
    cell: (info) => (
      <div className="flex items-center space-x-2">
        <Avatar
          className="sq-10"
          src={createImageUrl(info.row.original.avatar)}
          placeholder={info.row.original.avatarBlurHash}
          size={60}
        />
        <p>{info.getValue()}</p>
      </div>
    ),
  }),
  columnHelper.accessor("lastName", {
    id: "lastName",
    header: () => "Last name",
    cell: (info) => info.getValue(),
  }),
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
export default function Users() {
  const { users, count } = useLoaderData<typeof loader>()
  return (
    <div className="space-y-2">
      <h1 className="text-4xl">Users</h1>
      <div className="flex gap-2">
        <div>
          <Search className="max-w-[400px]" />
        </div>
      </div>
      <Table data={users} count={count} columns={columns} />
    </div>
  )
}
