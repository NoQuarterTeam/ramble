"use client"

import { merge } from "@ramble/shared"

import { buttonSizeStyles, buttonStyles } from "@/components/ui"
import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"

export function Nav() {
  return (
    <div className="flex h-nav w-full items-center justify-between border-b bg-background px-4 align-middle xl:px-12">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex w-[100px] text-primary items-center space-x-1 text-2xl italic font-bold">
          ramble
        </Link>

        <div className="hidden items-center space-x-1 md:flex">
          <NavbarLink href="/">Map</NavbarLink>
          <NavbarLink href="/spots">Latest spots</NavbarLink>
          <NavbarLink href="/guides">Guides</NavbarLink>
        </div>
      </div>
      <div className="flex space-x-3">
        <NavbarLink className="hidden md:flex" href="/blog">
          Blog
        </NavbarLink>
        <NavbarLink className="hidden md:flex" href="/about">
          About
        </NavbarLink>
      </div>
    </div>
  )
}

function NavbarLink(props: LinkProps & { className?: string; children?: React.ReactNode }) {
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
