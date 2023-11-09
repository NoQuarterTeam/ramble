import * as React from "react"
import { useSearchParams } from "@remix-run/react"
import { SearchIcon, X } from "lucide-react"
import queryString from "query-string"

import { merge } from "@ramble/shared"

import { IconButton, Input, type InputProps } from "~/components/ui"

export function Search({ placeholder, name = "search", ...props }: InputProps) {
  const [params, setParams] = useSearchParams()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const val = e.target as HTMLFormElement
    const search = val[name] as HTMLInputElement
    const existingParams = queryString.parse(params.toString())
    if (!search) {
      delete existingParams[name]
    } else {
      existingParams[name] = search.value
    }
    if (existingParams.page) delete existingParams.page
    setParams(queryString.stringify(existingParams))
  }
  const clearSearch = () => {
    const existingParams = queryString.parse(params.toString())
    delete existingParams[name]
    setParams(queryString.stringify(existingParams))
  }

  return (
    <form className="relative w-full" onSubmit={handleSubmit}>
      <div className="center absolute left-1 top-0 h-full">
        <IconButton size="xs" type="submit" aria-label="search" variant="ghost" icon={<SearchIcon className="sq-4" />} />
      </div>
      <Input
        name={name}
        placeholder={placeholder || "Search"}
        key={params.get(name) || ""}
        defaultValue={params.get(name) || ""}
        {...props}
        className={merge("px-9", props.className)}
      />
      <div className="center absolute right-1 top-0 h-full">
        {!!params.get(name) && (
          <IconButton size="xs" onClick={clearSearch} aria-label="clear search" variant="ghost" icon={<X className="sq-4" />} />
        )}
      </div>
    </form>
  )
}
