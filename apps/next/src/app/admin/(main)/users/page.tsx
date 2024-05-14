import { Pagination } from "@/components/Pagination"
import { Search } from "@/components/Search"
import { TableSortLink } from "@/components/TableSortLink"
import { Avatar } from "@/components/ui"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { requireAdmin } from "@/lib/server/auth"
import { db } from "@/lib/server/db"
import type { TableParams } from "@/lib/table"
import type { Prisma, User } from "@ramble/database/types"
import { createAssetUrl, promiseHash } from "@ramble/shared"
import dayjs from "dayjs"
import Link from "next/link"

export const dynamic = "force-dynamic"

const TAKE = 25
const getItemsAndCount = async ({ page, search, sort = "desc", sortBy = "createdAt" }: TableParams<User>) => {
  await requireAdmin()
  const skip = page ? (Number(page) - 1) * TAKE : 0

  const where = {
    deletedAt: null,
    OR: search
      ? [
          { username: { contains: search } },
          { email: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ]
      : undefined,
  } as Prisma.UserWhereInput

  return promiseHash({
    users: db.user.findMany({
      where,
      orderBy: { [sortBy]: sort },
      take: TAKE,
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

export default async function Page({ searchParams }: { searchParams: TableParams<User> }) {
  const { users, count } = await getItemsAndCount(searchParams)

  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Users</h1>
      <div className="flex items-end gap-2">
        <Search />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <TableSortLink<User> field="firstName">Name</TableSortLink>
            </TableHead>
            <TableHead>
              <TableSortLink<User> field="username">Username</TableSortLink>
            </TableHead>
            <TableHead>
              <TableSortLink<User> field="email">Email</TableSortLink>
            </TableHead>
            <TableHead>
              <TableSortLink<User> field="createdAt" isDefault className="justify-end">
                Created at
              </TableSortLink>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Link href={`/admin/users/${user.id}`} className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <Avatar src={createAssetUrl(user.avatar)} size={40} className="w-8 h-8" />
                  </div>
                  <p className="line-clamp-1">
                    {user.firstName} {user.lastName}
                  </p>
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/admin/users/${user.id}`}>{user.username}</Link>
              </TableCell>
              <TableCell>
                <Link href={`/admin/users/${user.id}`}>{user.email}</Link>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/users/${user.id}`}>{dayjs(user.createdAt).format("DD/MM/YYYY")}</Link>
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
