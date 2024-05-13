import { Pagination } from "@/components/Pagination"
import { Search } from "@/components/Search"
import { TableCheckbox, TableSelect, TableSortLink } from "@/components/Table"

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { requireAdmin } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import type { TableParams } from "@/lib/table"
import type { Prisma, Spot, SpotType } from "@ramble/database/types"
import { SPOT_TYPE_OPTIONS, promiseHash } from "@ramble/shared"
import { SpotRow } from "./SpotRow"

export const dynamic = "force-dynamic"

type SpotParams = { type?: SpotType; unverified?: "true" | "false" } & TableParams<Spot>

const getItemsAndCount = async ({ page, unverified, type, search, sort = "desc", sortBy = "createdAt" }: SpotParams) => {
  await requireAdmin()
  const skip = page ? (Number(page) - 1) * 25 : 0
  const where = {
    deletedAt: null,
    verifiedAt: unverified === "true" ? null : undefined,
    type: type ? { equals: type } : undefined,
    name: search ? { contains: search } : undefined,
  } as Prisma.SpotWhereInput
  return promiseHash({
    spots: db.spot.findMany({
      where,
      orderBy: { [sortBy]: sort },
      take: 25,
      skip,
      select: {
        id: true,
        name: true,
        description: true,
        sourceUrl: true,
        createdAt: true,
        verifiedAt: true,
        latitude: true,
        longitude: true,
        type: true,
        creator: { select: { id: true, username: true, avatar: true } },
        verifier: { select: { id: true, username: true, avatar: true } },
        images: { select: { id: true, path: true }, take: 20 },
      },
    }),
    count: db.spot.count({ where }),
  })
}

export default async function Page({ searchParams }: { searchParams: SpotParams }) {
  const { spots, count } = await getItemsAndCount(searchParams)
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Spots</h1>
      <div className="flex items-end gap-2">
        <TableSelect defaultValue={searchParams.type || ""} name="type">
          <option value="">All types</option>
          {SPOT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TableSelect>
        <TableCheckbox name="unverified">Unverified</TableCheckbox>
        <Search />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <TableSortLink<Spot> field="name">Name</TableSortLink>
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Verifier</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>
              <TableSortLink<Spot> field="createdAt" isDefault>
                Created at
              </TableSortLink>
            </TableHead>
            <TableHead className="text-right"> </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spots.map((spot) => (
            <SpotRow key={spot.id} spot={spot} />
          ))}
        </TableBody>
      </Table>
      <div>
        <Pagination count={count} />
      </div>
    </div>
  )
}
