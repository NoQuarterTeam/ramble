import { Link, useFetcher, useSubmit } from "@remix-run/react"
import { Menu, Moon, Sun } from "lucide-react"

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, IconButton } from "@travel/ui"

import { LinkButton } from "~/components/LinkButton"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { useTheme } from "~/lib/theme"

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
      <div className="hstack hidden md:flex">
        <themeFetcher.Form action="/api/theme" method="post" replace>
          <input type="hidden" name="theme" value={isDark ? "light" : "dark"} />
          <IconButton
            type="submit"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            variant="ghost"
            icon={isDark ? <Sun className="sq-4" /> : <Moon className="sq-4" />}
          />
        </themeFetcher.Form>
        {user ? (
          <Button variant="outline" onClick={() => logoutSubmit(null, { method: "post", action: "/logout" })}>
            Logout
          </Button>
        ) : (
          <div className="hstack">
            <LinkButton variant="ghost" to="/login">
              Login
            </LinkButton>
            <LinkButton colorScheme="primary" to="/register">
              Register
            </LinkButton>
          </div>
        )}
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
    </div>
  )
}
