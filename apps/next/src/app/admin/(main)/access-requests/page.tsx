import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { db } from "@/lib/server/db"

import { Pagination } from "@/components/Pagination"
import { requireAdmin } from "@/lib/server/auth"
import { promiseHash } from "@ramble/shared"
import dayjs from "dayjs"
import { AccessRequestRow } from "./AccessRequestRow"

export const dynamic = "force-dynamic"

const getItemsAndCount = async ({ page }: { page?: string }) => {
  await requireAdmin()
  const skip = page ? (Number(page) - 1) * 25 : 0
  return promiseHash({
    accessRequests: db.accessRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      skip,
      select: {
        id: true,
        code: true,
        acceptedAt: true,
        email: true,
        user: { select: { id: true, username: true, avatar: true, createdAt: true } },
        createdAt: true,
      },
    }),
    count: db.accessRequest.count(),
  })
}

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
  const { accessRequests, count } = await getItemsAndCount({ page: searchParams.page })
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Access requests</h1>
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
            <TableHead>Email</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Accepted</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right"> </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accessRequests.map((accessRequest) => (
            <AccessRequestRow key={accessRequest.id} accessRequest={accessRequest} />
          ))}
        </TableBody>
      </Table>
      <div>
        <Pagination count={count} />
      </div>
    </div>
  )
}
