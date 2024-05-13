"use client"

import { SearchIcon, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { IconButton, Input } from "./ui"

export function Search() {
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get("search")
  const [search, setSearch] = React.useState(urlSearch || "")
  const router = useRouter()
  const pathname = usePathname()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const allParams = new URLSearchParams(searchParams)
    if (search) {
      allParams.set("search", search)
      allParams.delete("page")
    } else {
      allParams.delete("page")
      allParams.delete("search")
    }
    router.push(`${pathname}?${allParams}`)
  }
  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input className="px-10" name="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="absolute z-10 top-0 left-1 bottom-0 flex items-center justify-center">
        <IconButton type="submit" size="xs" aria-label="Search" variant="ghost" icon={<SearchIcon size={16} />} />
      </div>
      {(urlSearch || search) && (
        <div className="absolute z-10 top-0 right-1 bottom-0 flex items-center justify-center">
          <IconButton
            onClick={() => {
              setSearch("")
              const allParams = new URLSearchParams(searchParams)
              allParams.delete("search")
              router.push(`${pathname}?${allParams}`)
            }}
            size="xs"
            aria-label="Clear"
            variant="ghost"
            icon={<X size={16} />}
          />
        </div>
      )}
    </form>
  )
}
