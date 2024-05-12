"use client"
import { merge } from "@ramble/shared"
import { MoveDown, MoveUp } from "lucide-react"
import Link, { type LinkProps } from "next/link"
import { useSearchParams } from "next/navigation"

export function TableSortLink<T>({
  children,
  href,
  className,
  isDefault,
  field,
  ...props
}: {
  field: keyof T
  className?: string
  children: React.ReactNode
  isDefault?: boolean
} & LinkProps) {
  const searchParams = useSearchParams()
  const sortBy = searchParams.get("sortBy")
  const sort = searchParams.get("sort")
  const isSorted = sortBy ? sortBy === (field as string) : isDefault
  const isDesc = sort ? sort === "desc" : isDefault
  const search = new URLSearchParams({
    ...Object.fromEntries(searchParams),
    sortBy: field as string,
    sort: isSorted ? (isDesc ? "asc" : "desc") : "desc",
  })
  return (
    <Link href={`${href}?${search}`} {...props} className={merge("flex hover:underline items-center space-x-1", className)}>
      <span>{children}</span>
      <span className="w-2">{isSorted ? isDesc ? <MoveDown size={12} /> : <MoveUp size={12} /> : null}</span>
    </Link>
  )
}
