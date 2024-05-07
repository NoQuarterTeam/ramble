"use client"
import { Select } from "@/components/ui"
import type { SpotListSort } from "@ramble/shared"
import { useRouter, useSearchParams } from "next/navigation"

const SORT_OPTIONS: { value: SpotListSort; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "rated", label: "Top rated" },
  { value: "saved", label: "Most saved" },
] as const

export function SpotSort() {
  const router = useRouter()
  const searchParams = useSearchParams()
  return (
    <Select
      defaultValue={searchParams.get("sort") || ""}
      name="sort"
      onChange={(e) => {
        router.push(`/spots?sort=${e.target.value}&type=${searchParams.get("type") || ""}`)
      }}
    >
      {SORT_OPTIONS.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  )
}
