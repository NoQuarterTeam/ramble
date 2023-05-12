import * as React from "react"
import { useSearchParams } from "@remix-run/react"
import { SearchIcon, X } from "lucide-react"
import queryString from "query-string"

import { merge } from "@ramble/shared"
import { IconButton, Input, type InputProps } from "@ramble/ui"

export function Search({ placeholder, name = "search", ...props }: InputProps) {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = React.useState(params.get(name) || "")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!search && !params.get(name)) return
    const existingParams = queryString.parse(params.toString())
    if (!search) {
      delete existingParams[name]
    } else {
      existingParams[name] = search
    }
    if (existingParams.page) delete existingParams.page
    setParams(queryString.stringify(existingParams))
  }
  const clearSearch = () => {
    const existingParams = queryString.parse(params.toString())
    delete existingParams[name]
    setParams(queryString.stringify(existingParams))
    setSearch("")
  }

  const isPendingSearch = !!search || !!params.get(name)

  return (
    <form className="relative w-full" onSubmit={handleSubmit}>
      <div className="center absolute left-1 top-0 h-full">
        <IconButton size="xs" type="submit" aria-label="search" variant="ghost" icon={<SearchIcon className="sq-4" />} />
      </div>
      <Input
        name={name}
        placeholder={placeholder || "Search"}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        {...props}
        ref={undefined}
        className={merge("px-9", props.className)}
      />
      <div className="center absolute right-1 top-0 h-full">
        {!!isPendingSearch && (
          <IconButton size="xs" onClick={clearSearch} aria-label="clear search" variant="ghost" icon={<X className="sq-4" />} />
        )}
      </div>
    </form>
  )
}
