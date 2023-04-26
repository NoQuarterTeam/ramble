import { NavLink as RNavLink, type NavLinkProps } from "@remix-run/react"

import { merge } from "@travel/shared"

export function NavLink(props: NavLinkProps) {
  return (
    <RNavLink
      {...props}
      className={(linkProps) =>
        merge(
          "font-semibold hover:opacity-70",
          linkProps.isActive ? "text-primary-500" : "text-white",
          props.className ? (typeof props.className === "string" ? props.className : props.className(linkProps)) : "",
        )
      }
    >
      {props.children}
    </RNavLink>
  )
}
