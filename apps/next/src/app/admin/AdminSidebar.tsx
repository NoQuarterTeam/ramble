"use client"

import { type RambleIcon, buttonSizeStyles, buttonStyles } from "@/components/ui"
import { merge } from "@ramble/shared"
import { Flag, GaugeCircle, HelpingHand, Mail, MapPin, MessageCircle, Moon, Route, Sun, User } from "lucide-react"
import Link, { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"

export function AdminSidebar() {
  return (
    <div className="fixed left-0 top-nav flex h-nav-screen w-[50px] flex-col justify-between border-r bg-background px-0 py-4 md:w-[200px] md:px-4">
      <div className="flex flex-col space-y-2">
        <AdminNavLink Icon={GaugeCircle} href="/admin">
          Dashboard
        </AdminNavLink>
        <AdminNavLink Icon={User} href="/admin/users">
          Users
        </AdminNavLink>
        <AdminNavLink Icon={MapPin} href="/admin/spots">
          Spots
        </AdminNavLink>
        <AdminNavLink Icon={Route} href="/admin/trips">
          Trips
        </AdminNavLink>
        <AdminNavLink Icon={Flag} href="/admin/reports">
          Reports
        </AdminNavLink>
        <AdminNavLink Icon={HelpingHand} href="/admin/access-requests">
          Access requests
        </AdminNavLink>
        <AdminNavLink Icon={MessageCircle} href="/admin/feedback">
          Feedback
        </AdminNavLink>
      </div>
      <div className="space-y-2">
        <AdminNavLink Icon={Mail} href="/admin/emails">
          Emails
        </AdminNavLink>
      </div>
    </div>
  )
}

function AdminNavLink({
  href,
  children,
  Icon,
  ...props
}: LinkProps & {
  className?: string
  children?: React.ReactNode
  href: string
  Icon: RambleIcon
}) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      {...props}
      href={href}
      className={merge(
        buttonStyles({ size: "md", variant: isActive ? "secondary" : "ghost" }),
        buttonSizeStyles({ size: "md" }),
        "w-full justify-start space-x-2",
        props.className,
      )}
    >
      <Icon size={16} />
      <p className="hidden md:block">{children}</p>
    </Link>
  )
}
