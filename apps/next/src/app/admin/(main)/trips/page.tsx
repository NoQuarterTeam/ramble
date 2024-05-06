import { Pagination } from "@/components/Pagination"
import { Avatar } from "@/components/ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { requireAdmin } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import { createAssetUrl, promiseHash } from "@ramble/shared"
import dayjs from "dayjs"

export const dynamic = "force-dynamic"

const getItemsAndCount = async ({ page }: { page?: string }) => {
  await requireAdmin()
  const skip = page ? (Number(page) - 1) * 25 : 0

  return promiseHash({
    trips: db.trip.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      skip,
      select: {
        id: true,
        name: true,
        startDate: true,
        creator: { select: { id: true, username: true, avatar: true } },
        createdAt: true,
      },
    }),
    count: db.trip.count(),
  })
}

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
  const { trips, count } = await getItemsAndCount({ page: searchParams.page })
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Trips</h1>
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
					Show {unverifiedUsersCount} unverified
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
            <TableHead>Creator</TableHead>
            <TableHead>Start date</TableHead>
            <TableHead className="text-right">Created at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.map((trip) => (
            <TableRow key={trip.id}>
              <TableCell>
                <p className="line-clamp-1 max-w-md">{trip.name}</p>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <Avatar src={createAssetUrl(trip.creator.avatar)} size={40} className="w-8 h-8" />
                  </div>
                  <p className="line-clamp-1">{trip.creator.username}</p>
                </div>
              </TableCell>

              <TableCell>
                <p>{dayjs(trip.startDate).format("DD/MM/YYYY")}</p>
              </TableCell>
              <TableCell className="text-right">
                <p>{dayjs(trip.createdAt).format("DD/MM/YYYY")}</p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div>
        <Pagination count={count} />
      </div>
    </div>
  )
}
