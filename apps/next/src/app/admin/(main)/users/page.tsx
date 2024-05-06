import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { db } from "@/lib/server/db"

import { Pagination } from "@/components/Pagination"
import { Avatar } from "@/components/ui"
import { requireAdmin } from "@/lib/server/auth"
import type { Prisma } from "@ramble/database/types"
import { createAssetUrl, promiseHash } from "@ramble/shared"
import dayjs from "dayjs"

export const dynamic = "force-dynamic"

const getItemsAndCount = async ({ page }: { page?: string }) => {
  await requireAdmin()
  const skip = page ? (Number(page) - 1) * 25 : 0

  const where = { deletedAt: null } as Prisma.UserWhereInput

  return promiseHash({
    users: db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 25,
      skip,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    }),
    count: db.user.count({ where }),
  })
}

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
  const { users, count } = await getItemsAndCount({ page: searchParams.page })
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Users</h1>
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
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Created at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <Avatar src={createAssetUrl(user.avatar)} size={40} className="w-8 h-8" />
                  </div>
                  <p className="line-clamp-1">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <p>{user.username}</p>
              </TableCell>
              <TableCell>
                <p>{user.email}</p>
              </TableCell>
              <TableCell className="text-right">
                <p>{dayjs(user.createdAt).format("DD/MM/YYYY")}</p>
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
