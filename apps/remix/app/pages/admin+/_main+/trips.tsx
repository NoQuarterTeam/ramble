import { useLoaderData } from "@remix-run/react"
import { createColumnHelper } from "@tanstack/react-table"
import dayjs from "dayjs"
import { promiseHash } from "remix-utils/promise"

import { type Prisma } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { Avatar } from "~/components/ui"
import { Table } from "~/components/ui/Table"
import { db } from "~/lib/db.server"
import { json } from "~/lib/remix.server"
import { getTableParams } from "~/lib/table"
import { type LoaderFunctionArgs, type SerializeFrom } from "~/lib/vendor/vercel.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { orderBy, skip, take } = getTableParams(request)
  const where = {} satisfies Prisma.TripWhereInput

  const data = await promiseHash({
    trips: db.trip.findMany({ orderBy, skip, take, where, include: { creator: true } }),
    count: db.trip.count({ where }),
  })
  return json(data)
}

type Trip = SerializeFrom<typeof loader>["trips"][number]

const columnHelper = createColumnHelper<Trip>()
const columns = [
  columnHelper.accessor("name", {
    id: "name",
    header: () => "Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor((row) => row.creator, {
    id: "creator.firstName",
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
    header: () => "Creator",
  }),
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: () => "Created",
    cell: (info) => dayjs(info.getValue()).format("DD/MM/YYYY"),
  }),
]
export default function Trips() {
  const { trips, count } = useLoaderData<typeof loader>()
  return (
    <div className="space-y-2">
      <h1 className="text-4xl">Trips</h1>
      <Table data={trips} count={count} columns={columns} />
    </div>
  )
}
