import * as React from "react"
import type { ColumnDef, Row } from "@tanstack/react-table"
import { flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table"

import { IconButton, Tile } from "./ui"
import { join } from "@ramble/shared"
import { useSearchParams } from "@remix-run/react"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"
import queryString from "query-string"

export function Table<T>({
  data,
  columns,
  count,
  take,
  ExpandComponent,
}: {
  data: T[]
  columns: ColumnDef<T, any>[]
  count: number
  take: number
  ExpandComponent?: React.ComponentType<{ row: Row<T> }>
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => !!ExpandComponent,
    getExpandedRowModel: ExpandComponent ? getExpandedRowModel() : undefined,
  })
  const noOfPages = Math.ceil(count / take)
  return (
    <Tile className="w-min p-2">
      <table className="min-w-[600px] text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-1 text-left" colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={table.getAllFlatColumns().length} className="p-4 text-center">
                No spots found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, i) => (
              <React.Fragment key={row.id}>
                <tr className={join(i % 2 === 0 ? "bg-gray-100 dark:bg-gray-700" : "white dark:bg-black")}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="truncate p-1" style={{ maxWidth: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {ExpandComponent && row.getIsExpanded() && (
                  <tr className={join(i % 2 === 0 ? "bg-gray-100 dark:bg-gray-700" : "white dark:bg-black")}>
                    <td colSpan={row.getVisibleCells().length}>{ExpandComponent && <ExpandComponent row={row} />}</td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      <Pagination noOfPages={noOfPages} />
    </Tile>
  )
}
function Pagination({ noOfPages }: { noOfPages: number }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Number(searchParams.get("page")) || 1
  const existingParams = queryString.parse(searchParams.toString())
  return (
    <div className="flex items-center gap-2 text-sm">
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
      <span className="flex items-center gap-1">
        <div>Page</div>
        <strong>{currentPage}</strong>
        of
        <strong>{noOfPages}</strong>
      </span>
    </div>
  )
}
