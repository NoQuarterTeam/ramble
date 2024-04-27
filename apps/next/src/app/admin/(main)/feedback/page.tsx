import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { db } from "@/lib/server/db"

import { Pagination } from "@/components/Pagination"
import { Avatar } from "@/components/ui"
import { requireAdmin } from "@/lib/server/auth"
import { createAssetUrl, promiseHash } from "@ramble/shared"
import dayjs from "dayjs"

export const dynamic = "force-dynamic"

const getItemsAndCount = async ({ page }: { page?: string }) => {
  await requireAdmin()
  const skip = page ? (Number(page) - 1) * 25 : 0

  return promiseHash({
    feedbacks: db.feedback.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      skip,
      select: {
        id: true,
        message: true,
        user: { select: { id: true, username: true, avatar: true } },
        createdAt: true,
      },
    }),
    count: db.feedback.count(),
  })
}

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
  const { feedbacks, count } = await getItemsAndCount({ page: searchParams.page })
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Feedback</h1>
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
            <TableHead>Message</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead className="text-right">Created at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbacks.map((feedback) => (
            <TableRow key={feedback.id}>
              <TableCell>
                <p className="line-clamp-1">{feedback.message}</p>
              </TableCell>
              <TableCell>
                {feedback.user && (
                  <div className="flex items-center space-x-2">
                    <div>
                      <Avatar src={createAssetUrl(feedback.user.avatar)} size={40} className="w-8 h-8" />
                    </div>
                    <p className="line-clamp-1">{feedback.user.username}</p>
                  </div>
                )}
              </TableCell>

              <TableCell className="text-right">
                <p>{dayjs(feedback.createdAt).format("DD/MM/YYYY")}</p>
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
