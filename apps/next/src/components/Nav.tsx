"use client"

import { merge } from "@ramble/shared"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  buttonSizeStyles,
  buttonStyles,
} from "@/components/ui"
import { Menu } from "lucide-react"
import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"

export function Nav() {
  return (
    <div className="fixed top-0 left-0 z-10 flex h-nav w-full items-center justify-between border-b bg-background px-4 align-middle xl:px-12">
      <div className="flex items-center">
        <Link href="/" className="flex w-[100px] text-primary text-2xl italic font-bold">
          ramble
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          <NavbarLink href="/">Map</NavbarLink>
          <NavbarLink href="/spots">Latest spots</NavbarLink>
          {/* <NavbarLink href="/guides">Guides</NavbarLink> */}
        </div>
      </div>
      <div className="hidden md:flex space-x-1">
        <NavbarLink href="/blog">Blog</NavbarLink>
        <NavbarLink href="/about">About</NavbarLink>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton variant="outline" icon={<Menu size={16} />} aria-label="menu" className="flex md:hidden" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] p-1 py-1.5">
          <div className="block md:hidden">
            <DropdownMenuItem asChild>
              <Link href="/">Map</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/spots">Latest spots</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/blog">Blog</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/about">About</Link>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
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
