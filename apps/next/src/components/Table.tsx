"use client"
import { merge } from "@ramble/shared"
import { MoveDown, MoveUp, Square, SquareCheck } from "lucide-react"
import Link, { type LinkProps } from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button, type ButtonProps, Select, type SelectProps } from "./ui"

export function TableCheckbox<T>({
  className,
  isDefault,
  name,
  ...props
}: {
  name: keyof T
  className?: string
  isDefault?: boolean
} & ButtonProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const isToggled = searchParams.get(name) === "true"
  return (
    <Button
      onClick={() => {
        const search = new URLSearchParams(searchParams.toString())
        if (isToggled) search.delete(name)
        else search.set(name, "true")
        router.push(`${pathname}?${search}`)
      }}
      variant="outline"
      rightIcon={isToggled ? <SquareCheck size={16} /> : <Square size={16} />}
      {...props}
    />
  )
}

export function TableSelect<T>({
  className,
  isDefault,
  name,
  ...props
}: {
  name: keyof T
  className?: string
  isDefault?: boolean
} & SelectProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  return (
    <Select
      onChange={(e) => {
        const search = new URLSearchParams(searchParams.toString())
        if (e.target.value) search.set(name, e.target.value)
        else search.delete(name)
        router.push(`${pathname}?${search}`)
      }}
      {...props}
    />
  )
}

export function TableSortLink<T>({
  children,
  className,
  isDefault,
  field,
  ...props
}: {
  field: keyof T
  className?: string
  children: React.ReactNode
  isDefault?: boolean
} & Omit<LinkProps, "href">) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
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
    <Link href={`${pathname}?${search}`} {...props} className={merge("flex hover:underline items-center space-x-1", className)}>
      <span>{children}</span>
      <span className="w-2">{isSorted ? isDesc ? <MoveDown size={12} /> : <MoveUp size={12} /> : null}</span>
    </Link>
  )
}
