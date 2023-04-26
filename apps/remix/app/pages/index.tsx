import { json, type LoaderArgs } from "@vercel/remix"
import { Link, useFetcher, useLoaderData, useSubmit } from "@remix-run/react"
import Map, { FullscreenControl, GeolocateControl, Marker, NavigationControl } from "react-map-gl"
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  Icons,
  Limiter,
} from "@travel/ui"

import { LinkButton } from "~/components/LinkButton"
import { useTheme } from "~/lib/theme"
import { getMaybeUser } from "~/services/auth/auth.server"
import { Menu, Moon, Sun } from "lucide-react"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getMaybeUser(request)
  return json(user)
}

export default function Home() {
  const user = useLoaderData<typeof loader>()
  const logoutSubmit = useSubmit()
  const themeFetcher = useFetcher()

  const theme = useTheme()
  const isDark = theme === "dark"
  return (
    <div className="relative">
      <div className="absolute left-0 top-0 z-50 w-full border-b border-solid border-gray-50 dark:border-gray-700">
        <Limiter className="bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between py-5 align-middle">
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
        </Limiter>
      </div>
      <MapView />
    </div>
  )
}

function MapView() {
  const theme = useTheme()
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Map
        style={{ height: "100%", width: "100%" }}
        initialViewState={{
          longitude: 4,
          latitude: 52,
          zoom: 3.5,
        }}
        attributionControl={false}
        mapStyle={
          theme === "dark"
            ? "mapbox://styles/jclackett/ck44lf1f60a7j1cowkgjr6f3j"
            : "mapbox://styles/jclackett/ckcqlc8j6040i1ipeuh4s5fey"
        }
        mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
      ></Map>
    </div>
  )
}
