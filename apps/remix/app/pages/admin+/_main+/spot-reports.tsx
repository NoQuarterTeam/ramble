import { Link, useLoaderData } from "@remix-run/react"
import { Row, createColumnHelper } from "@tanstack/react-table"
import dayjs from "dayjs"
import { Check, Eye, EyeOff, Trash } from "lucide-react"
import { promiseHash } from "remix-utils/promise"
import { z } from "zod"

import type { Prisma } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { useFetcher } from "~/components/Form"
import { Search } from "~/components/Search"
import { SpotIcon } from "~/components/SpotIcon"
import { Table } from "~/components/Table"
import { Avatar, IconButton } from "~/components/ui"
import { db } from "~/lib/db.server"
import { FormActionInput } from "~/lib/form"
import { createAction, createActions } from "~/lib/form.server"
import { json } from "~/lib/remix.server"
import { getTableParams } from "~/lib/table"
import type { ActionFunctionArgs, LoaderFunctionArgs, SerializeFrom } from "~/lib/vendor/vercel.server"
import { getCurrentAdmin } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { orderBy, search, skip, take } = getTableParams(request)
  const where = {
    deletedAt: null,
    OR: search
      ? [
          { notes: { path: "$.name", string_contains: search } },
          { notes: { path: "$.type", string_contains: search } },
          { notes: { path: "$.notes", string_contains: search } },
          { notes: { path: "$.address", string_contains: search } },
          { notes: { path: "$.description", string_contains: search } },
        ]
      : undefined,
  } satisfies Prisma.SpotRevisionWhereInput

  const data = await promiseHash({
    spotRevisions: db.spotRevision.findMany({
      orderBy,
      skip,
      take,
      where,
      select: {
        id: true,
        notes: true,
        spot: true,
        creator: true,
        createdAt: true,
        approver: true,
        approvedAt: true,
      },
    }),
    count: db.spotRevision.count({ where, take: undefined, skip: undefined }),
  })
  return json(data)
}

enum Actions {
  delete = "delete",
  approve = "approve",
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentAdmin(request)
  return createActions<Actions>(request, {
    delete: () =>
      createAction(request)
        .input(z.object({ id: z.string().uuid() }))
        .handler(async (data) => {
          await db.spotRevision.update({ where: { id: data.id }, data: { deletedAt: new Date() } })
          return json({ success: true })
        }),
    approve: () =>
      createAction(request)
        .input(z.object({ id: z.string().uuid() }))
        .handler(async (data) => {
          await db.spotRevision.update({
            where: { id: data.id },
            data: { approvedAt: new Date(), approver: { connect: { id: user.id } } },
          })
          return json({ success: true })
        }),
  })
}

type SpotRevision = SerializeFrom<typeof loader>["spotRevisions"][number]

const columnHelper = createColumnHelper<SpotRevision>()
const columns = [
  columnHelper.accessor((row) => row.spot, {
    id: "spot.name",
    size: 300,
    cell: (info) => (
      <Link to={`/spots/${info.getValue().id}`} target="_blank" className="flex items-center space-x-2">
        <SpotIcon type={info.getValue().type} size={16} className="flex-shrink-0" />
        <p className="truncate">{info.getValue().name}</p>
      </Link>
    ),
    header: () => "Spot",
  }),

  columnHelper.accessor((row) => row.creator, {
    id: "creator.firstName",
    size: 120,
    cell: (info) => (
      <div className="flex items-center space-x-2">
        <Avatar
          className="sq-8"
          src={createImageUrl(info.getValue().avatar)}
          placeholder={info.getValue().avatarBlurHash}
          size={40}
        />
        <p>{info.getValue().firstName}</p>
      </div>
    ),
    header: () => "Creator",
  }),
  columnHelper.accessor((row) => row.approver, {
    id: "approver.firstName",
    size: 120,
    header: () => "Approver",
    cell: ({ row }) =>
      row.original.approvedAt && row.original.approver ? (
        <div className="flex items-center space-x-2">
          <Avatar
            className="sq-8"
            src={createImageUrl(row.original.approver.avatar)}
            placeholder={row.original.approver.avatarBlurHash}
            size={40}
          />
          <p>{row.original.approver.firstName}</p>
        </div>
      ) : (
        <ApproveAction item={row.original} />
      ),
  }),
  columnHelper.accessor((row) => row.createdAt, {
    id: "createdAt",
    size: 70,
    cell: (info) => dayjs(info.getValue()).format("DD/MM/YYYY"),
    header: () => "Created At",
  }),
  columnHelper.display({
    id: "actions",
    size: 30,
    enableSorting: false,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex items-center space-x-1">
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="expand"
          onClick={row.getToggleExpandedHandler()}
          icon={row.getIsExpanded() ? <EyeOff size={16} /> : <Eye size={16} />}
        />
        <DeleteAction item={row.original} />
      </div>
    ),
  }),
]

export default function SpotReports() {
  const { spotRevisions, count } = useLoaderData<typeof loader>()

  return (
    <div className="space-y-2">
      <h1 className="text-4xl">Spot Reports</h1>
      <div className="flex items-end gap-2">
        <div>
          <Search className="max-w-[400px]" placeholder="Search notes" />
        </div>
      </div>
      <Table data={spotRevisions} count={count} columns={columns} ExpandComponent={RenderSubComponent} />
    </div>
  )
}

function ApproveAction({ item }: { item: SpotRevision }) {
  const verifyFetcher = useFetcher()
  return (
    <verifyFetcher.Form>
      <input type="hidden" name="id" value={item.id} />
      <verifyFetcher.FormButton value={Actions.approve} size="sm" leftIcon={<Check size={16} />}>
        Mark as approved
      </verifyFetcher.FormButton>
    </verifyFetcher.Form>
  )
}
function DeleteAction({ item }: { item: SpotRevision }) {
  const deleteFetcher = useFetcher()
  return (
    <deleteFetcher.Form>
      <input type="hidden" name="id" value={item.id} />
      <FormActionInput value={Actions.delete} />
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

function RenderSubComponent({ row }: { row: Row<SpotRevision> }) {
  const notes = row.original.notes as Prisma.JsonObject
  const spot = row.original.spot
  return (
    <ul className="p-2">
      {spot.name !== notes.name && (
        <li>
          <b>Name: </b>
          {notes.name?.toString()}
        </li>
      )}
      {spot.description !== notes.description && (
        <li>
          <b>Description: </b>
          {notes.description?.toString()}
        </li>
      )}
      {notes.flaggedImageIds && notes.flaggedImageIds.toString().length > 0 && (
        <li>
          <b>Flagged image Ids: </b>
          {notes.flaggedImageIds?.toString()}
        </li>
      )}
      {notes.type !== spot.type && (
        <li>
          <b>Type: </b>
          {notes.type?.toString()}
        </li>
      )}
      {notes.address && notes.address !== spot.address && (
        <li>
          <b>Address: </b>
          {notes.address?.toString()}
        </li>
      )}
      {notes.latitude && notes.latitude !== spot.latitude && (
        <li>
          <b>Latitude: </b>
          {notes.latitude?.toString()}
        </li>
      )}

      {notes.longitude && notes.longitude !== spot.longitude && (
        <li>
          <b>Longitude: </b>
          {notes.longitude?.toString()}
        </li>
      )}
      {notes.amenties && (
        <li>
          <b>Amenities: </b>
          {JSON.stringify(notes.amenities)}
        </li>
      )}
      {notes.notes && (
        <li>
          <b>Notes: </b>
          {notes.notes?.toString()}
        </li>
      )}
    </ul>
  )
}
