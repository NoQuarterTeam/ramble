import * as React from "react"
import { useSearchParams } from "@remix-run/react"
import type { ColumnDef, Row } from "@tanstack/react-table"
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoveDown, MoveUp } from "lucide-react"
import queryString from "query-string"

import { join } from "@ramble/shared"

import { IconButton, Tile } from "./ui"

export function Table<T>({
  data,
  columns,
  count,
  take,
  ExpandComponent,
}: {
  data: T[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<T, any>[]
  count: number
  take: number
  ExpandComponent?: React.ComponentType<{ row: Row<T> }>
}) {
  const [searchParams, setSearchParams] = useSearchParams()

  const orderBy = searchParams.get("orderBy")
  const order = searchParams.get("order")

  const table = useReactTable({
    data,
    columns,
    manualSorting: false,
    enableMultiSort: false,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => !!ExpandComponent,
    getExpandedRowModel: ExpandComponent ? getExpandedRowModel() : undefined,
  })
  const noOfPages = Math.ceil(count / take)
  return (
    <Tile className="space-y-1 p-2">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  onClick={
                    header.column.getCanSort()
                      ? () => {
                          const newSearchParams = queryString.stringify({
                            ...queryString.parse(searchParams.toString()),
                            orderBy: header.column.id,
                            order:
                              orderBy && orderBy !== header.column.id
                                ? order || "desc"
                                : order === "asc" || !order
                                ? "desc"
                                : "asc",
                          })
                          setSearchParams(newSearchParams)
                        }
                      : undefined
                  }
                >
                  <div
                    className={join(
                      "mb-1 flex items-center justify-between whitespace-nowrap px-2 py-1 text-left font-medium",
                      header.column.getCanSort() && "cursor-pointer select-none rounded hover:bg-gray-100",
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {orderBy && order && header.column.getCanSort() && header.column.id === orderBy ? (
                      <span className="w-4 text-sm">{order === "asc" ? <MoveUp size={16} /> : <MoveDown size={16} />}</span>
                    ) : (
                      <span className="w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={table.getAllFlatColumns().length} className="p-8 text-center">
                No items found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, i) => (
              <React.Fragment key={row.id}>
                <tr className={join(i % 2 === 0 ? "bg-gray-100 dark:bg-gray-700" : "white dark:bg-black")}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="truncate px-2 py-1"
                      style={{ width: cell.column.getSize(), maxWidth: cell.column.getSize() }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {ExpandComponent && row.getIsExpanded() && (
                  <tr className={join(i % 2 === 0 ? "bg-gray-100 dark:bg-gray-700" : "white dark:bg-black")}>
                    <td style={{ maxWidth: table.getTotalSize() }} colSpan={row.getVisibleCells().length}>
                      {ExpandComponent && <ExpandComponent row={row} />}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      <Pagination count={count} noOfPages={noOfPages} />
    </Tile>
  )
}
function Pagination({ noOfPages, count }: { noOfPages: number; count: number }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Number(searchParams.get("page")) || 1
  const existingParams = queryString.parse(searchParams.toString())
  return (
    <div className="flex items-center justify-between px-2">
      <p className="text-sm">{count} items</p>

      <div className="flex items-center gap-2 text-sm">
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>{currentPage}</strong>
          of
          <strong>{noOfPages}</strong>
        </span>
        <IconButton
          size="sm"
          aria-label="first page"
          icon={<ChevronsLeft size={16} />}
          variant="outline"
          onClick={() => setSearchParams(queryString.stringify({ ...existingParams, page: 1 }))}
          disabled={currentPage === 1}
        />
        <IconButton
          size="sm"
          aria-label="previous page"
          icon={<ChevronLeft size={16} />}
          variant="outline"
          onClick={() => setSearchParams(queryString.stringify({ ...existingParams, page: currentPage - 1 }))}
          disabled={currentPage === 1}
        />
        <IconButton
          size="sm"
          aria-label="back"
          icon={<ChevronRight size={16} />}
          variant="outline"
          onClick={() => setSearchParams(queryString.stringify({ ...existingParams, page: currentPage + 1 }))}
          disabled={currentPage === noOfPages}
        />
        <IconButton
          size="sm"
          icon={<ChevronsRight size={16} />}
          aria-label="back"
          variant="outline"
          onClick={() => setSearchParams(queryString.stringify({ ...existingParams, page: noOfPages }))}
          disabled={currentPage === noOfPages}
        />
      </div>
    </div>
  )
}
