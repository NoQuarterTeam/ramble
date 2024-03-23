import { Form, Link, useLoaderData, useRouteError, useSearchParams } from "@remix-run/react"
import type { Row } from "@tanstack/react-table"
import { createColumnHelper } from "@tanstack/react-table"
import dayjs from "dayjs"
import { Check, ExternalLink, Eye, EyeOff, Trash } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"
import { ExistingSearchParams } from "remix-utils/existing-search-params"
import { promiseHash } from "remix-utils/promise"
import { z } from "zod"
import { zx } from "zodix"

import type { Prisma, SpotType } from "@ramble/database/types"
import { SPOT_TYPE_OPTIONS, createAssetUrl, merge } from "@ramble/shared"

import { useFetcher } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { OptimizedImage } from "~/components/OptimisedImage"
import { Search } from "~/components/Search"
import { SpotIcon } from "~/components/SpotIcon"
import { Avatar, Button, IconButton, Select, buttonStyles, iconbuttonStyles } from "~/components/ui"
import { Table } from "~/components/ui/Table"
import { db } from "~/lib/db.server"
import { FormActionInput } from "~/lib/form"
import { createAction, createActions } from "~/lib/form.server"
import { badRequest, json } from "~/lib/remix.server"
import { getTableParams } from "~/lib/table"
import { useTheme } from "~/lib/theme"
import type { ActionFunctionArgs, LoaderFunctionArgs, SerializeFrom } from "~/lib/vendor/vercel.server"
import { getCurrentAdmin } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const schema = z.object({ type: z.string().optional(), unverified: zx.BoolAsString.optional() })
  const { orderBy, search, skip, take } = getTableParams(request)

  const result = schema.safeParse(queryString.parse(new URL(request.url).search, { arrayFormat: "bracket" }))
  if (!result.success) throw badRequest(result.error.message)
  const where = {
    deletedAt: null,
    OR: search ? [{ name: { contains: search } }, { description: { contains: search } }] : undefined,
    type: result.data.type ? { equals: result.data.type as SpotType } : undefined,
    verifiedAt: result.data.unverified ? { equals: null } : undefined,
  } satisfies Prisma.SpotWhereInput

  const data = await promiseHash({
    spots: db.spot.findMany({
      orderBy,
      skip,
      take,
      where,
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
        creator: true,
        verifier: true,
        images: true,
      },
    }),
    count: db.spot.count({ where, take: undefined, skip: undefined }),
    unverifiedSpotsCount: db.spot.count({ where: { ...where, verifiedAt: null }, take: undefined, skip: undefined }),
  })
  return json(data, request, {
    headers: {
      "cache-control": cacheHeader({ maxAge: "1 hour", sMaxage: "1 hour" }),
    },
  })
}

enum Actions {
  delete = "delete",
  verify = "verify",
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = await getCurrentAdmin(request)
  return createActions<Actions>(request, {
    delete: () =>
      createAction(request)
        .input(z.object({ id: z.string().uuid() }))
        .handler(async (data) => {
          await db.spot.update({ where: { id: data.id }, data: { deletedAt: new Date() } })
          return json({ success: true })
        }),
    verify: () =>
      createAction(request)
        .input(z.object({ id: z.string().uuid() }))
        .handler(async (data) => {
          await db.spot.update({
            where: { id: data.id },
            data: { verifiedAt: new Date(), verifier: { connect: { id: user.id } } },
          })
          return json({ success: true })
        }),
  })
}

type Spot = SerializeFrom<typeof loader>["spots"][number]

const columnHelper = createColumnHelper<Spot>()
const columns = [
  columnHelper.accessor("name", {
    id: "name",
    size: 300,
    header: () => "Name",
    cell: (info) => {
      return (
        <Link to={`/spots/${info.row.original.id}`} target="_blank" className="flex items-center space-x-2">
          <SpotIcon type={info.row.original.type} size={16} className="flex-shrink-0" />
          <p className="truncate">{info.getValue()}</p>
        </Link>
      )
    },
  }),
  columnHelper.accessor((row) => row.description, {
    id: "description",
    size: 400,
    maxSize: 400,
    enableSorting: false,
    cell: (info) => info.getValue(),
    header: () => "Description",
  }),
  columnHelper.accessor((row) => row.creator, {
    id: "creator.firstName",
    size: 120,
    cell: (info) => (
      <div className="flex items-center space-x-2">
        <Avatar
          className="sq-8"
          src={createAssetUrl(info.getValue().avatar)}
          placeholder={info.getValue().avatarBlurHash}
          size={40}
        />
        <p>{info.getValue().firstName}</p>
      </div>
    ),
    header: () => "Creator",
  }),
  columnHelper.accessor((row) => row.verifier, {
    id: "verifier.firstName",
    size: 120,
    header: () => "Verifier",
    cell: ({ row }) =>
      row.original.verifiedAt && row.original.verifier ? (
        <div className="flex items-center space-x-2">
          <Avatar
            className="sq-8"
            src={createAssetUrl(row.original.verifier.avatar)}
            placeholder={row.original.verifier.avatarBlurHash}
            size={40}
          />
          <p>{row.original.verifier.firstName}</p>
        </div>
      ) : (
        <VerifyAction item={row.original} />
      ),
  }),
  columnHelper.accessor((row) => row.createdAt, {
    id: "createdAt",
    size: 120,
    cell: (info) => dayjs(info.getValue()).format("DD/MM/YYYY"),
    header: () => "Created At",
  }),
  columnHelper.display({
    id: "actions",
    size: 110,
    enableSorting: false,
    header: () => null,
    cell: ({ row }) => (
      <div className="flex items-center space-x-1">
        {row.original.sourceUrl && (
          <Link
            to={row.original.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={merge(buttonStyles({ size: "sm", disabled: false, variant: "ghost" }), iconbuttonStyles({ size: "sm" }))}
          >
            <ExternalLink size={16} />
          </Link>
        )}
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

export default function Spots() {
  const [searchParams] = useSearchParams()
  const { spots, count, unverifiedSpotsCount } = useLoaderData<typeof loader>()

  return (
    <div className="space-y-2">
      <h1 className="text-4xl">Spots</h1>
      <div className="flex items-end gap-2">
        <Form>
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
        </Form>

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
        </Form>

        <div>
          <Search />
        </div>
      </div>
      <Table data={spots} count={count} columns={columns} ExpandComponent={RenderSubComponent} />
    </div>
  )
}

function RenderSubComponent({ row }: { row: Row<Spot> }) {
  const spot = row.original
  const theme = useTheme()
  const mapImageUrl = `https://api.mapbox.com/styles/v1/jclackett/${
    theme === "dark" ? "clh82otfi00ay01r5bftedls1" : "clh82jh0q00b601pp2jfl30sh"
  }/static/geojson(%7B%22type%22%3A%22Point%22%2C%22coordinates%22%3A%5B${spot.longitude}%2C${spot.latitude}%5D%7D)/${
    spot.longitude
  },${
    spot.latitude
  },4/300x200@2x?access_token=pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw`

  return (
    <div className="flex w-full gap-1 overflow-x-scroll p-1">
      <div className="flex-shrink-0">
        <img height={200} width={300} className="h-[200px] w-[300px] rounded" alt="location" src={mapImageUrl} />
      </div>
      {spot.images.map((image) => (
        <div key={image.id}>
          <OptimizedImage
            height={200}
            width={300}
            placeholder={image.blurHash}
            fit="cover"
            className="h-[200px] w-[300px] rounded"
            alt="spot"
            src={createAssetUrl(image.path)}
          />
        </div>
      ))}
    </div>
  )
}

function VerifyAction({ item }: { item: Spot }) {
  const verifyFetcher = useFetcher()
  return (
    <verifyFetcher.Form>
      <input type="hidden" name="id" value={item.id} />
      <verifyFetcher.FormButton value={Actions.verify} size="sm" leftIcon={<Check size={16} />}>
        verify
      </verifyFetcher.FormButton>
    </verifyFetcher.Form>
  )
}
function DeleteAction({ item }: { item: Spot }) {
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

export function ErrorBoundary() {
  const error = useRouteError()
  const isError = error instanceof Error
  return (
    <div className="space-y-4">
      <h1 className="text-4xl">Spots</h1>
      {isError ? (
        <div className="space-y-4">
          <LinkButton to="/admin/spots" variant="outline">
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
