import { Link, useFetcher, useSubmit } from "@remix-run/react"
import { LogOut, Menu, Moon, Plus, Sun, User } from "lucide-react"

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
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { createImageUrl } from "~/lib/s3"
import { useTheme } from "~/lib/theme"
import { ClientOnly } from "@travel/shared"

export function Nav() {
  const user = useMaybeUser()
  const logoutSubmit = useSubmit()
  const themeFetcher = useFetcher()

  const theme = useTheme()
  const isDark = theme === "dark"
  return (
    <div className="h-nav flex w-full items-center justify-between border-b border-solid border-gray-50 bg-white px-4 align-middle dark:border-gray-700 dark:bg-gray-800 md:px-20">
      <div className="hstack h-12 space-x-6">
        <div className="hstack">
          <ClientOnly>
            <Link to={`/map${typeof window !== "undefined" ? window.location.search : ""}`} className="text-xl font-semibold">
              Travel
            </Link>
          </ClientOnly>
        </div>
      </div>
      <div className="hstack space-x-3">
        <Tooltip label="Add a spot">
          <IconButton icon={<Plus className="sq-4" />} aria-label="add spot" variant="outline" />
        </Tooltip>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar
                className="hover:opacity-70"
                src={createImageUrl(user.avatar)}
                name={user.firstName + " " + user.lastName}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] space-y-2 p-1">
              <DropdownMenuItem asChild>
                <LinkButton
                  to="/profile"
                  variant="ghost"
                  className="flex w-full items-center justify-start outline-none"
                  leftIcon={<User className="sq-4 mr-2" />}
                >
                  Profile
                </LinkButton>
              </DropdownMenuItem>

              <themeFetcher.Form action="/api/theme" method="post" replace className="w-full">
                <input type="hidden" name="theme" value={isDark ? "light" : "dark"} />

                <DropdownMenuItem onSelect={(event) => event.preventDefault()} asChild>
                  <Button
                    variant="ghost"
                    type="submit"
                    className="flex w-full items-center justify-start outline-none"
                    leftIcon={isDark ? <Sun className="sq-4 mr-2" /> : <Moon className="sq-4 mr-2" />}
                  >
                    <span>{isDark ? "Light" : "Dark"} mode</span>
                  </Button>
                </DropdownMenuItem>
              </themeFetcher.Form>
              <DropdownMenuItem asChild>
                <Button
                  onClick={() => logoutSubmit(null, { method: "post", action: "/logout" })}
                  variant="ghost"
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
              <LinkButton variant="ghost" to="/login">
                Login
              </LinkButton>
              <LinkButton to="/register">Register</LinkButton>
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
                    <Button variant="ghost" onClick={() => logoutSubmit(null, { method: "post", action: "/logout" })}>
                      Log out
                    </Button>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/register">Register</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/login">Login</Link>
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
