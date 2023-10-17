import { useLoaderData } from "@remix-run/react"
import { createColumnHelper } from "@tanstack/react-table"
import dayjs from "dayjs"
import { Trash } from "lucide-react"
import { promiseHash } from "remix-utils/promise"

import { type Prisma } from "@ramble/database/types"

import { useFetcher } from "~/components/Form"
import { Search } from "~/components/Search"
import { Table } from "~/components/Table"
import { IconButton } from "~/components/ui"
import { db } from "~/lib/db.server"
import { FormActionInput } from "~/lib/form"
import { formError, getFormAction, validateFormData } from "~/lib/form.server"
import { badRequest, json } from "~/lib/remix.server"
import { getTableParams } from "~/lib/table"
import { type ActionFunctionArgs, type LoaderFunctionArgs, type SerializeFrom } from "~/lib/vendor/vercel.server"
import { z } from "~/lib/vendor/zod.server"
import { getCurrentAdmin } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { orderBy, search, skip, take } = getTableParams(request)
  const where = {
    OR: search
      ? [{ email: { contains: search } }, { firstName: { contains: search } }, { lastName: { contains: search } }]
      : undefined,
  } satisfies Prisma.UserWhereInput

  const data = await promiseHash({
    accessRequests: db.accessRequest.findMany({ orderBy, skip, take, where }),
    count: db.accessRequest.count({ where }),
  })
  return json(data)
}

type AccessRequest = SerializeFrom<typeof loader>["accessRequests"][number]

enum Actions {
  Delete = "Delete",
}

export const action = async ({ request }: ActionFunctionArgs) => {
  await getCurrentAdmin(request)
  const formAction = await getFormAction<Actions>(request)
  switch (formAction) {
    case Actions.Delete:
      try {
        const deleteSchema = z.object({ id: z.string() })
        const result = await validateFormData(request, deleteSchema)
        if (!result.success) return formError(result)
        const data = result.data
        await db.accessRequest.delete({ where: { id: data.id } })
        return json({ success: true })
      } catch {
        return badRequest("Error deleting request", request, {
          flash: { title: "Error deleting request", description: "Please try again" },
        })
      }
    default:
      break
  }
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
  columnHelper.display({
    id: "actions",
    size: 110,
    enableSorting: false,
    header: () => null,
    cell: ({ row }) => <DeleteAction item={row.original} />,
  }),
]
export default function AccessRequests() {
  const { accessRequests, count } = useLoaderData<typeof loader>()
  return (
    <div className="space-y-2">
      <h1 className="text-4xl">Access Requests</h1>
      <div className="flex gap-2">
        <div>
          <Search className="max-w-[400px]" />
        </div>
      </div>
      <Table data={accessRequests} count={count} columns={columns} />
    </div>
  )
}

function DeleteAction({ item }: { item: AccessRequest }) {
  const deleteFetcher = useFetcher()

  return (
    <deleteFetcher.Form>
      <input type="hidden" name="id" value={item.id} />

      <FormActionInput value={Actions.Delete} />
      <IconButton
        type="submit"
        isLoading={deleteFetcher.state !== "idle"}
        aria-label="delete"
        size="sm"
        variant="ghost"
        icon={<Trash className="text-red-500" size={16} />}
      />
    </deleteFetcher.Form>
  )
}
