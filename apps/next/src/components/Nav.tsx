import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton } from "@/components/ui"
// import { getMaybeUser } from "@/lib/server/auth"
import { Menu } from "lucide-react"
import Link from "next/link"
// import { Suspense } from "react"
import { NavLink } from "./NavLink"

export function Nav() {
  return (
    <div className="fixed top-0 left-0 z-10 flex h-nav w-full items-center justify-between border-b bg-background px-4 align-middle xl:px-12">
      <div className="flex items-center">
        <Link href="/" className="flex w-[100px] text-primary text-2xl italic font-bold">
          ramble
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          <NavLink href="/map">Map</NavLink>
          <NavLink href="/spots">Latest spots</NavLink>
          {/* <NavLink href="/guides">Guides</NavLink> */}
        </div>
      </div>
      <div className="hidden md:flex space-x-1">
        {/* <Suspense>
          <AdminLink />
        </Suspense> */}
        <NavLink href="/blog">Blog</NavLink>
        <NavLink href="/">About</NavLink>
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
            {/* <DropdownMenuItem asChild>
              <Link href="/guides">Guides</Link>
            </DropdownMenuItem> */}
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

// async function AdminLink() {
//   const user = await getMaybeUser()
//   if (!user?.isAdmin) return null
//   return <NavLink href="/admin">Admin</NavLink>
// }
