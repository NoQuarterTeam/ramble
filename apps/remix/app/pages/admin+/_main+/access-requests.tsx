import { useLoaderData, useRouteError, useSearchParams } from "@remix-run/react"
import { createColumnHelper } from "@tanstack/react-table"
import dayjs from "dayjs"
import { Check, Trash } from "lucide-react"
import { promiseHash } from "remix-utils/promise"
import { z } from "zod"

import { type Prisma } from "@ramble/database/types"

import { useFetcher } from "~/components/Form"
import { Search } from "~/components/Search"
import { Table } from "~/components/Table"
import { Button, IconButton, Tooltip } from "~/components/ui"
import { db } from "~/lib/db.server"
import { FormActionInput } from "~/lib/form"
import { createAction, createActions } from "~/lib/form.server"
import { badRequest, json } from "~/lib/remix.server"
import { getTableParams } from "~/lib/table"
import { type ActionFunctionArgs, type LoaderFunctionArgs, type SerializeFrom } from "~/lib/vendor/vercel.server"
import { getCurrentAdmin } from "~/services/auth/auth.server"
import { sendBetaInvitationEmail } from "@ramble/api"
import queryString from "query-string"
import { zx } from "zodix"
import { LinkButton } from "~/components/LinkButton"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { orderBy, search, skip, take } = getTableParams(request)

  const schema = z.object({ unaccepted: zx.BoolAsString.optional() })
  const result = schema.safeParse(queryString.parse(new URL(request.url).search))
  if (!result.success) throw badRequest(result.error.message)

  const where = {
    OR: search ? [{ email: { contains: search } }] : undefined,
    acceptedAt: result.data.unaccepted ? { equals: null } : undefined,
  } satisfies Prisma.AccessRequestWhereInput

  const data = await promiseHash({
    accessRequests: db.accessRequest.findMany({
      orderBy,
      skip,
      take,
      where,
      select: { id: true, email: true, createdAt: true, acceptedAt: true, user: { select: { createdAt: true } } },
    }),
    count: db.accessRequest.count({ where }),
  })
  return json(data)
}

type AccessRequest = SerializeFrom<typeof loader>["accessRequests"][number]

enum Actions {
  accept = "accept",
  delete = "delete",
}

export const action = async ({ request }: ActionFunctionArgs) => {
  await getCurrentAdmin(request)
  return createActions<Actions>(request, {
    accept: () =>
      createAction(request)
        .input(z.object({ id: z.string() }))
        .handler(async (data) => {
          const request = await db.accessRequest.update({ where: { id: data.id }, data: { acceptedAt: new Date() } })
          await sendBetaInvitationEmail(request.email, request.id)
          return json({ success: true })
        }),
    delete: () =>
      createAction(request)
        .input(z.object({ id: z.string() }))
        .handler(async (data) => {
          await db.accessRequest.delete({ where: { id: data.id } })
          return json({ success: true })
        }),
  })
}

const columnHelper = createColumnHelper<AccessRequest>()
const columns = [
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
  columnHelper.accessor("acceptedAt", {
    id: "acceptedAt",
    header: () => "Accepted",
    cell: (info) => (info.getValue() ? dayjs(info.getValue()).format("DD/MM/YYYY") : "-"),
  }),
  columnHelper.accessor((row) => row.user?.createdAt, {
    id: "user.createdAt",
    header: () => "Joined",
    cell: (info) => (info.getValue() ? dayjs(info.getValue()).format("DD/MM/YYYY") : "-"),
  }),
  columnHelper.display({
    id: "actions",
    size: 100,
    enableSorting: false,
    header: () => null,
    cell: ({ row }) => (
      <div className="hstack justify-end">
        {!row.original.user && <AcceptAction item={row.original} />}
        {!row.original.acceptedAt && <DeleteAction item={row.original} />}
      </div>
    ),
  }),
]
export default function AccessRequests() {
  const { accessRequests, count } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  return (
    <div className="space-y-2">
      <h1 className="text-4xl">Access Requests</h1>
      <div className="flex gap-2">
        <div>
          <Button
            variant={searchParams.get("unaccepted") === "true" ? "primary" : "outline"}
            onClick={() => {
              const existingParams = queryString.parse(searchParams.toString())
              setSearchParams(
                queryString.stringify({
                  ...existingParams,
                  unaccepted: searchParams.get("unaccepted") === "true" ? undefined : true,
                }),
              )
            }}
          >
            Show unaccepted
          </Button>
        </div>

        <div>
          <Search className="max-w-[400px]" />
        </div>
      </div>
      <Table data={accessRequests} count={count} columns={columns} />
    </div>
  )
}

function AcceptAction({ item }: { item: AccessRequest }) {
  const fetcher = useFetcher()

  return (
    <fetcher.Form>
      <input type="hidden" name="id" value={item.id} />

      <FormActionInput value={Actions.accept} />
      <Tooltip label={item.acceptedAt ? "Resend invite" : "Send invite"}>
        <IconButton type="submit" isLoading={fetcher.state !== "idle"} aria-label="delete" size="sm" icon={<Check size={16} />} />
      </Tooltip>
    </fetcher.Form>
  )
}

function DeleteAction({ item }: { item: AccessRequest }) {
  const fetcher = useFetcher()

  return (
    <fetcher.Form>
      <input type="hidden" name="id" value={item.id} />

      <FormActionInput value={Actions.delete} />
      <IconButton
        type="submit"
        isLoading={fetcher.state !== "idle"}
        aria-label="delete"
        size="sm"
        variant="ghost"
        icon={<Trash className="text-red-500" size={16} />}
      />
    </fetcher.Form>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  const isError = error instanceof Error
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Spots</h1>
      {isError ? (
        <div className="space-y-4">
          <LinkButton to="/admin/access-requesets" variant="outline">
            Back to list
          </LinkButton>
          <pre className="rounded-xs bg-gray-100 p-1 text-sm dark:bg-gray-950">{error.message}</pre>
        </div>
      ) : (
        <p>Unknown error</p>
      )}
    </div>
  )
}
