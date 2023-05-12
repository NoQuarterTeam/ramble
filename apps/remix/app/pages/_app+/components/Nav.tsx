import { Link, useFetcher, useNavigate, useSubmit } from "@remix-run/react"
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
} from "@ramble/ui"

import { LinkButton } from "~/components/LinkButton"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"

import { useTheme } from "~/lib/theme"
import { ClientOnly, createImageUrl } from "@ramble/shared"

export function Nav() {
  const user = useMaybeUser()
  const logoutSubmit = useSubmit()
  const themeFetcher = useFetcher()

  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme === "dark"
  return (
    <div className="h-nav flex w-full items-center justify-between border-b border-solid border-gray-50 bg-white px-4 align-middle dark:border-gray-700 dark:bg-gray-800 md:px-8">
      <div className="flex items-center space-x-4">
        <ClientOnly>
          <Link to={`/map${typeof window !== "undefined" ? window.location.search : ""}`} className="font-ribeye-marrow text-xl">
            Ramble
          </Link>
        </ClientOnly>

        <div className="flex items-center">
          <ClientOnly>
            <LinkButton variant="ghost" to={`/map${typeof window !== "undefined" ? window.location.search : ""}`}>
              Map
            </LinkButton>
          </ClientOnly>
          <LinkButton variant="ghost" to="/latest">
            Latest
          </LinkButton>
        </div>
      </div>
      <div className="hstack space-x-3">
        {user && (
          <Tooltip label="Add a spot">
            <IconButton
              onClick={() => navigate(`/spots/new${window.location.search}`)}
              icon={<Plus className="sq-4" />}
              aria-label="add spot"
              variant="outline"
            />
          </Tooltip>
        )}
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
