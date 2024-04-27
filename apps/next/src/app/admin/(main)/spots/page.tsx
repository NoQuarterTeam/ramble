import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { db } from "@/lib/server/db"

import { Pagination } from "@/components/Pagination"
import { requireAdmin } from "@/lib/server/auth"
import type { Prisma } from "@ramble/database/types"
import { promiseHash } from "@ramble/shared"
import { SpotRow } from "./SpotRow"

export const dynamic = "force-dynamic"

const getItemsAndCount = async ({ page }: { page?: string }) => {
  await requireAdmin()
  const skip = page ? (Number(page) - 1) * 25 : 0
  const where = { deletedAt: null } as Prisma.SpotWhereInput
  return promiseHash({
    spots: db.spot.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
  const { spots, count } = await getItemsAndCount({ page: searchParams.page })
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Spots</h1>
      <div className="flex items-end gap-2">
        {/* <form>
				<ExistingSearchParams exclude={["type"]} />
				<p className="font-medium text-sm">Type</p>
				<Select
					defaultValue={searchParams.get("type") || ""}
					onChange={(e) => e.currentTarget.form?.dispatchEvent(new Event("submit", { bubbles: true }))}
					name="type"
				>
					<option value="">All</option>
					{SPOT_TYPE_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</Select>
			</form> */}
        {/* 
			<Form>
				<ExistingSearchParams exclude={["unverified"]} />
				<Button
					variant={searchParams.get("unverified") === "true" ? "primary" : "outline"}
					type="submit"
					name={searchParams.get("unverified") === "true" ? undefined : "unverified"}
					value={searchParams.get("unverified") === "true" ? undefined : "true"}
				>
					Show {unverifiedSpotsCount} unverified
				</Button>
			</Form> */}

        {/* <div>
				<Search />
			</div> */}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Verifier</TableHead>
            <TableHead>Created at</TableHead>
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
