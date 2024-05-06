"use client"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { IconButton } from "./ui"

export function Pagination({ count, defaultTake }: { count: number; defaultTake?: number }) {
  const searchParams = useSearchParams()
  const take = Number(searchParams.get("take") || defaultTake || "25")
  const noOfPages = Math.ceil(count / take)
  const currentPage = Number(searchParams.get("page") || "1")
  const router = useRouter()
  const pathname = usePathname()
  const maxPages = 5
  const halfMaxPages = Math.floor(maxPages / 2)
  const pageNumbers = [] as Array<number>
  if (noOfPages <= maxPages) {
    for (let i = 1; i <= noOfPages; i++) {
      pageNumbers.push(i)
    }
  } else {
    let startPage = currentPage - halfMaxPages
    let endPage = currentPage + halfMaxPages

    if (startPage < 1) {
      endPage += Math.abs(startPage) + 1
      startPage = 1
    }

    if (endPage > noOfPages) {
      startPage -= endPage - noOfPages
      endPage = noOfPages
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
  }

  return (
    <div className="flex items-center justify-between px-2">
      <p>{count} items</p>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1 text-sm">
            <div>Page</div>
            <strong>{currentPage}</strong>
            of
            <strong>{noOfPages}</strong>
          </span>
          <IconButton
            size="xs"
            name="page"
            onClick={() => router.push(`${pathname}?page=1`)}
            aria-label="first page"
            icon={<ChevronsLeft size={16} />}
            variant="outline"
            disabled={currentPage === 1}
          />
          <IconButton
            size="xs"
            name="page"
            onClick={() => router.push(`${pathname}?page=${currentPage - 1}`)}
            aria-label="previous page"
            icon={<ChevronLeft size={16} />}
            variant="outline"
            disabled={currentPage === 1}
          />
          {pageNumbers.map((pageNumber) => {
            const isCurrentPage = pageNumber === currentPage
            const isValidPage = pageNumber >= 0 && pageNumber <= count
            return (
              <IconButton
                variant={isCurrentPage ? "secondary" : "outline"}
                size="xs"
                name="page"
                onClick={() => router.push(`${pathname}?page=${pageNumber}`)}
                key={`${pageNumber}-active`}
                aria-label={`Page ${pageNumber}`}
                disabled={!isValidPage}
                icon={<div>{pageNumber}</div>}
              />
            )
          })}
          <IconButton
            size="xs"
            aria-label="next page"
            name="page"
            onClick={() => router.push(`${pathname}?page=${currentPage + 1}`)}
            icon={<ChevronRight size={16} />}
            variant="outline"
            disabled={currentPage === noOfPages}
          />
          <IconButton
            size="xs"
            icon={<ChevronsRight size={16} />}
            aria-label="last page"
            variant="outline"
            name="page"
            onClick={() => router.push(`${pathname}?page=${noOfPages}`)}
            disabled={currentPage === noOfPages}
          />
        </div>

        {/* <Form>
          <ExistingSearchParams exclude={["take"]} />
          <Select
            size="xs"
            name="take"
            value={take}
            onChange={(e) => e.currentTarget.form?.dispatchEvent(new Event("submit", { bubbles: true }))}
          >
            <option value="15">15 per page</option>
            <option value="30">30 per page</option>
            <option value="50">50 per page</option>
          </Select>
        </Form> */}
      </div>
    </div>
  )
}
