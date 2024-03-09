import { type NavLinkProps, NavLink as RNavLink } from "@remix-run/react"

import { merge } from "@ramble/shared"

export function NavLink(props: NavLinkProps) {
  return (
    <RNavLink
      {...props}
      className={(linkProps) =>
        merge(props.className ? (typeof props.className === "string" ? props.className : props.className(linkProps)) : "")
      }
    >
      {props.children}
    </RNavLink>
  )
}
