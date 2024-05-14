"use client"

import { Square, SquareCheck } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button, type ButtonProps, IconButton, type IconButtonProps, Select, type SelectProps } from "./ui"

export function SearchParamButton<T extends Record<string, unknown> | unknown>({
  name,
  value,
  ...props
}: {
  name: keyof T
  value: string
} & ButtonProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const isToggled = (searchParams.get(name) || "") === value
  return (
    <Button
      onClick={() => {
        const search = new URLSearchParams(searchParams.toString())
        if (isToggled) {
          search.delete(name)
        } else {
          search.set(name, value)
        }
        router.push(`${pathname}?${search}`)
      }}
      variant={isToggled ? "primary" : "outline"}
      {...props}
    />
  )
}
export function SearchParamIconButton<T extends Record<string, unknown> | unknown>({
  name,
  value,
  ...props
}: {
  name: keyof T
  value: string
} & IconButtonProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const isToggled = (searchParams.get(name) || "") === value
  return (
    <IconButton
      onClick={() => {
        const search = new URLSearchParams(searchParams.toString())
        if (isToggled) {
          search.delete(name)
        } else {
          search.set(name, value)
        }
        router.push(`${pathname}?${search}`)
      }}
      variant={isToggled ? "primary" : "outline"}
      {...props}
    />
  )
}

export function SearchParamCheckbox<T extends Record<string, unknown> | unknown>({
  name,
  ...props
}: {
  name: keyof T
} & ButtonProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const isToggled = (searchParams.get(name) || "") === "true"
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

export function SearchParamSelect<T extends Record<string, unknown> | unknown>({
  name,
  ...props
}: {
  name: keyof T
} & SelectProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  return (
    <Select
      defaultValue={searchParams.get(name) || ""}
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
