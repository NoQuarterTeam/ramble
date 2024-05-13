"use client"

import { merge } from "@ramble/shared"
import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { buttonSizeStyles, buttonStyles } from "./ui"

export function NavLink(props: LinkProps & { className?: string; children?: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === props.href
  return (
    <Link
      {...props}
      href={props.href}
      className={merge(
        buttonStyles({ size: "md", variant: isActive ? "secondary" : "ghost" }),
        buttonSizeStyles({ size: "md" }),
        props.className,
      )}
    >
      {props.children}
    </Link>
  )
}
