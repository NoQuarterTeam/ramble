import * as React from "react"
import { LogOut, Menu, Plus, User as UserIcon } from "lucide-react"
import Link from "next/link"

import { type User } from "@travel/database/types"
import {
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  Tooltip,
} from "@travel/ui"

import { LinkButton } from "~/components/LinkButton"

import { MapFilters } from "./MapFilters"
import { ThemeSwitcher } from "./ThemeSwitcher"

export function Nav() {
  const user = null as User | null

  return (
    <div className="h-nav flex w-full items-center justify-between border-b border-solid border-gray-50 bg-white px-6 align-middle dark:border-gray-700 dark:bg-gray-800">
      <div className="hstack h-12 space-x-6">
        <div className="hstack">
          <p className="text-xl font-semibold">Travel</p>
        </div>
      </div>
      <React.Suspense>
        <MapFilters />
      </React.Suspense>
      <div className="hstack space-x-3">
        <Tooltip label="Add a spot">
          <IconButton icon={<Plus className="sq-4" />} aria-label="add spot" variant="outline" />
        </Tooltip>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="hover:opacity-70" src={user.avatar} name={user.firstName + " " + user.lastName} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] space-y-2 p-1">
              <DropdownMenuItem asChild>
                <LinkButton
                  href="/profile"
                  variant="ghost"
                  size="sm"
                  className="flex w-full items-center justify-start outline-none"
                  leftIcon={<UserIcon className="sq-4 mr-2" />}
                >
                  Profile
                </LinkButton>
              </DropdownMenuItem>
              <ThemeSwitcher />
              <DropdownMenuItem asChild>
                <Button
                  // onClick={() => logoutSubmit(null, { method: "post", action: "/logout" })}
                  variant="ghost"
                  size="sm"
                  className="flex w-full items-center justify-start outline-none"
                  leftIcon={<LogOut className="sq-4 mr-2" />}
                >
                  Logout
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <div className="hstack hidden md:flex">
              <LinkButton variant="ghost" href="/login">
                Login
              </LinkButton>
              <LinkButton colorScheme="primary" href="/register">
                Register
              </LinkButton>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  className="inline-block md:hidden"
                  aria-label={`Toggle open menu`}
                  icon={<Menu className="sq-5" />}
                  variant="ghost"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="inline-block md:hidden">
                {user ? (
                  <DropdownMenuItem asChild>
                    <Button
                      variant="ghost"
                      // onClick={() => logoutSubmit(null, { method: "post", action: "/logout" })}
                    >
                      Log out
                    </Button>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Register</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  )
}
