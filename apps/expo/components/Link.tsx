import { Link as ELink } from "expo-router"

import { merge } from "@ramble/shared"

export function Link(props: {
  asChild?: boolean
  numberOfLines?: number
  children: React.ReactNode
  className?: string
  href: string
}) {
  return (
    <ELink {...props} className={merge("font-400 dark:text-white", props.className)}>
      {props.children}
    </ELink>
  )
}
