import type { NavLinkProps } from "@remix-run/react"
import { Link, NavLink, useNavigate, useSubmit } from "@remix-run/react"
import { Heart, LogOut, Moon, Plus, Settings, Sun, UserCircle, UserCog } from "lucide-react"

import { createAssetUrl, merge } from "@ramble/shared"

import { useFetcher } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import {
  Avatar,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  Tooltip,
  buttonSizeStyles,
  buttonStyles,
} from "~/components/ui"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { useTheme } from "~/lib/theme"
import { Feedback } from "~/pages/api+/feedback"

export function Nav() {
  const user = useMaybeUser()
  const logoutSubmit = useSubmit()
  const themeFetcher = useFetcher()

  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme === "dark"
  return (
    <div className="fixed top-0 left-0 z-10 flex h-nav w-full items-center justify-between border-b bg-background px-4 align-middle xl:px-12">
      <div className="flex items-center space-x-4">
        <Link to="/map" className="brand-header font flex w-[100px] items-center space-x-1 text-2xl">
          ramble
        </Link>

        <div className="hidden items-center space-x-1 md:flex">
          <NavbarLink to="/map">Map</NavbarLink>
          <NavbarLink to="/spots" end>
            Latest spots
          </NavbarLink>
          <NavbarLink to="/guides">Guides</NavbarLink>
          <NavbarLink to="/vans">Vans</NavbarLink>
        </div>
      </div>
      <div className="hstack space-x-3">
        <NavbarLink className="hidden md:flex" to="/home">
          About
        </NavbarLink>
        {user ? (
          <>
            <Feedback />
            <Tooltip label="Add a spot">
              <IconButton
                onClick={() => navigate(`/spots/new${window.location.search}`)}
                icon={<Plus className="sq-4" />}
                aria-label="add spot"
                variant="outline"
              />
            </Tooltip>
          </>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild={!user}>
            {user ? (
              <Avatar
                size={60}
                placeholder={user.avatarBlurHash}
                className="sq-10 hover:opacity-70"
                src={createAssetUrl(user.avatar)}
              />
            ) : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] p-1 py-1.5">
            <div className="block md:hidden">
              <DropdownMenuItem asChild>
                <Link to="/map">Map</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/spots">Latest spots</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/guides">Guides</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/home">About</Link>
              </DropdownMenuItem>
              <hr />
            </div>

            {user && (
              <>
                <DropdownMenuItem asChild>
                  <LinkButton variant="ghost" to={`/${user.username}`} leftIcon={<UserCircle className="sq-4" />}>
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
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <LinkButton variant="ghost" to="/admin" leftIcon={<UserCog className="sq-4" />}>
                      Admin
                    </LinkButton>
                  </DropdownMenuItem>
                )}
                <themeFetcher.Form action="/api/theme" className="w-full">
                  <input type="hidden" name="theme" value={isDark ? "light" : "dark"} />
                  <DropdownMenuItem onSelect={(event: Event) => event.preventDefault()} asChild>
                    <themeFetcher.FormButton
                      variant="ghost"
                      leftIcon={isDark ? <Sun className="sq-4" /> : <Moon className="sq-4" />}
                    >
                      <span>{isDark ? "Light" : "Dark"} mode</span>
                    </themeFetcher.FormButton>
                  </DropdownMenuItem>
                </themeFetcher.Form>
              </>
            )}

            {user ? (
              <DropdownMenuItem asChild>
                <Button
                  onClick={() => logoutSubmit(null, { method: "POST", action: "/logout" })}
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
                {/* <DropdownMenuItem asChild>
                  <Link to="/register">Register</Link>
                </DropdownMenuItem> */}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function NavbarLink(props: NavLinkProps & { className?: string }) {
  return (
    <NavLink
      {...props}
      to={props.to}
      className={({ isActive }) =>
        merge(
          buttonStyles({ size: "md", variant: isActive ? "secondary" : "ghost" }),
          buttonSizeStyles({ size: "md" }),
          props.className,
        )
      }
    >
      {props.children}
    </NavLink>
  )
}
