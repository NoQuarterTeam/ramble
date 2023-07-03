import { Link, useFetcher, useNavigate, useSubmit } from "@remix-run/react"
import { Heart, LogOut, Menu, Moon, Plus, Settings, Sun, User } from "lucide-react"

import { ClientOnly, createImageUrl } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import {
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  Icons,
  Tooltip,
} from "~/components/ui"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { useTheme } from "~/lib/theme"

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
        <ClientOnly fallback={<Logo to="/map" />}>
          <Logo to={`/map${typeof window !== "undefined" ? window.location.search : ""}`} />
        </ClientOnly>

        <div className="hidden items-center md:flex">
          <ClientOnly
            fallback={
              <LinkButton variant="ghost" to={`/map`}>
                Map
              </LinkButton>
            }
          >
            <LinkButton variant="ghost" to={`/map${typeof window !== "undefined" ? window.location.search : ""}`}>
              Map
            </LinkButton>
          </ClientOnly>
          <LinkButton variant="ghost" to="/latest">
            Latest
          </LinkButton>
          <LinkButton variant="ghost" to="/rated">
            Top rated
          </LinkButton>
        </div>
      </div>
      <div className="hstack space-x-3">
        {user ? (
          <Tooltip label="Add a spot">
            <IconButton
              onClick={() => navigate(`/spots/new${window.location.search}`)}
              icon={<Plus className="sq-4" />}
              aria-label="add spot"
              variant="outline"
            />
          </Tooltip>
        ) : (
          <div className="hstack hidden md:flex">
            <LinkButton variant="ghost" to="/login">
              Login
            </LinkButton>
            <LinkButton to="/register">Register</LinkButton>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger>
            {user ? (
              <Avatar
                className="hover:opacity-70"
                src={createImageUrl(user.avatar)}
                name={user.firstName + " " + user.lastName}
              />
            ) : (
              <IconButton
                className="inline-block md:hidden"
                aria-label={`Toggle open menu`}
                icon={<Menu className="sq-5" />}
                variant="ghost"
              />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] p-1 py-1.5">
            <div className="block md:hidden">
              <DropdownMenuItem asChild>
                <Link to="/map">Map</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/latest">Latest</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/rated">Top rated</Link>
              </DropdownMenuItem>
              <hr />
            </div>

            {user && (
              <>
                <DropdownMenuItem asChild>
                  <LinkButton variant="ghost" to={`/${user.username}`} leftIcon={<User className="sq-4" />}>
                    Profile
                  </LinkButton>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LinkButton variant="ghost" to={`/${user.username}/lists`} leftIcon={<Heart className="sq-4" />}>
                    Lists
                  </LinkButton>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <LinkButton variant="ghost" to="/account" leftIcon={<Settings className="sq-4" />}>
                    Account
                  </LinkButton>
                </DropdownMenuItem>
                <themeFetcher.Form action="/api/theme" method="post" replace className="w-full">
                  <input type="hidden" name="theme" value={isDark ? "light" : "dark"} />

                  <DropdownMenuItem onSelect={(event: Event) => event.preventDefault()} asChild>
                    <Button
                      variant="ghost"
                      type="submit"
                      leftIcon={isDark ? <Sun className="sq-4" /> : <Moon className="sq-4" />}
                    >
                      <span>{isDark ? "Light" : "Dark"} mode</span>
                    </Button>
                  </DropdownMenuItem>
                </themeFetcher.Form>
              </>
            )}

            {user ? (
              <DropdownMenuItem asChild>
                <Button
                  onClick={() => logoutSubmit(null, { method: "post", action: "/logout" })}
                  variant="ghost"
                  leftIcon={<LogOut className="sq-4" />}
                >
                  Logout
                </Button>
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/login">Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/register">Register</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function Logo({ to }: { to: string }) {
  return (
    <Link to={to} className="flex w-[100px] items-center space-x-1">
      <span>
        <Icons.Van size={24} />
      </span>
      <span className="text-xl font-medium">Ramble</span>
    </Link>
  )
}
