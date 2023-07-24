import { useLoaderData } from "@remix-run/react"
import { json, type LoaderArgs, type SerializeFrom } from "@vercel/remix"

import { type Prisma } from "@ramble/database/types"

import { Search } from "~/components/Search"
import { Column, Table } from "~/components/Table"
import { Avatar, Tile } from "~/components/ui"
import { db } from "~/lib/db.server"
import { getTableParams } from "~/lib/table"
import { createImageUrl } from "@ramble/shared"

const TAKE = 10
export const loader = async ({ request }: LoaderArgs) => {
  const { orderBy, search, skip, take } = getTableParams(request, TAKE, { orderBy: "createdAt", order: "desc" })
  const where = {
    OR: search ? [{ name: { contains: search } }] : undefined,
  } satisfies Prisma.SpotWhereInput
  const spots = await db.spot.findMany({
    orderBy,
    skip,
    take,
    where,
    include: { creator: true },
  })
  const count = await db.spot.count({ where, take: undefined, skip: undefined })
  return json({ spots, count })
}

type Spot = SerializeFrom<typeof loader>["spots"][number]

export default function Spots() {
  const { spots, count } = useLoaderData<typeof loader>()
  return (
    <div className="stack">
      <h1 className="text-4xl">Spots</h1>
      <Search />
      <Tile>
        <Table<Spot> data={spots} take={TAKE} count={count}>
          <Column<Spot> sortKey="name" header="Name" row={(spot) => spot.name} />
          <Column<Spot> sortKey="address" header="Address" row={(spot) => spot.address} />
          <Column<Spot>
            className="max-w-[200px]"
            header="Creator"
            row={(spot) => (
              <div className="flex items-center space-x-2">
                <Avatar size={30} placeholder={spot.creator.avatarBlurHash} src={createImageUrl(spot.creator.avatar)} />
                <p>{spot.creator.firstName}</p>
              </div>
            )}
          />
          <Column<Spot>
            className="max-w-[100px]"
            sortKey="createdAt"
            header="Created"
            row={(spot) => new Intl.DateTimeFormat("en-GB").format(new Date(spot.createdAt))}
          />
        </Table>
      </Tile>
    </div>
  )
}
