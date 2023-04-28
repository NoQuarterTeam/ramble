import { Link, useFetcher, useSubmit } from "@remix-run/react"
import { LogOut, Menu, Moon, Sun, User } from "lucide-react"

import { Avatar, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton } from "@travel/ui"

import { LinkButton } from "~/components/LinkButton"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { useTheme } from "~/lib/theme"

import { MapFilters } from "./MapFilters"

export function Nav() {
  const user = useMaybeUser()
  const logoutSubmit = useSubmit()
  const themeFetcher = useFetcher()

  const theme = useTheme()
  const isDark = theme === "dark"
  return (
    <div className="h-nav absolute left-0 top-0 z-50 flex w-full items-center justify-between border-b border-solid border-gray-50 bg-white px-6 align-middle dark:border-gray-700 dark:bg-gray-800">
      <div className="hstack h-12 space-x-6">
        <Link to="/">
          <div className="hstack">
            <p className="text-xl font-semibold">Travel</p>
          </div>
        </Link>
      </div>
      <MapFilters />
      <div className="hstack">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="hover:opacity-70" src={user.avatar} name={user.firstName + " " + user.lastName} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] space-y-2 p-1">
              <LinkButton
                to="/profile"
                variant="ghost"
                size="sm"
                className="flex w-full items-center justify-start outline-none"
                leftIcon={<User className="sq-4 mr-2" />}
              >
                Profile
              </LinkButton>
              <themeFetcher.Form action="/api/theme" method="post" replace className="w-full">
                <input type="hidden" name="theme" value={isDark ? "light" : "dark"} />

                <Button
                  variant="ghost"
                  size="sm"
                  type="submit"
                  className="flex w-full items-center justify-start outline-none"
                  leftIcon={isDark ? <Sun className="sq-4 mr-2" /> : <Moon className="sq-4 mr-2" />}
                >
                  <span>{isDark ? "Light" : "Dark"} mode</span>
                </Button>
              </themeFetcher.Form>
              <Button
                onClick={() => logoutSubmit(null, { method: "post", action: "/logout" })}
                variant="ghost"
                size="sm"
                className="flex w-full items-center justify-start outline-none"
                leftIcon={<LogOut className="sq-4 mr-2" />}
              >
                Logout
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <div className="hstack hidden md:flex">
              <LinkButton variant="ghost" to="/login">
                Login
              </LinkButton>
              <LinkButton colorScheme="primary" to="/register">
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
