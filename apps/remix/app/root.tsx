import "@fontsource/urbanist/300.css"
import "@fontsource/urbanist/400.css"
import "@fontsource/urbanist/500.css"
import "@fontsource/urbanist/600.css"
import "@fontsource/urbanist/700.css"
import "@fontsource/poppins/300.css"
import "@fontsource/poppins/400.css"
import "@fontsource/poppins/500.css"
import "@fontsource/poppins/600.css"
import "@fontsource/poppins/700.css"
import "@fontsource/poppins/800.css"
import "@fontsource/poppins/900.css"
import "~/styles/app.css"

import * as React from "react"
import * as Tooltip from "@radix-ui/react-tooltip"
import { cssBundleHref } from "@remix-run/css-bundle"
import type { ShouldRevalidateFunction } from "@remix-run/react"
import {
  isRouteErrorResponse,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetchers,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react"
import { Analytics } from "@vercel/analytics/react"

import { Frown } from "lucide-react"
import NProgress from "nprogress"
import { AuthenticityTokenProvider } from "remix-utils/csrf/react"
import { promiseHash } from "remix-utils/promise"

import { join } from "@ramble/shared"

import { Toaster } from "~/components/ui"

import { LinkButton } from "./components/LinkButton"
import { FULL_WEB_URL } from "./lib/config.server"
import { type Theme } from "./lib/theme"

import { getMaybeUser } from "./services/auth/auth.server"
import { csrf } from "./services/session/csrf.server.ts"
import { getFlashSession } from "./services/session/flash.server"
import { getThemeSession } from "./services/session/theme.server"
import { defaultPreferences, Preferences, preferencesCookies } from "./services/session/preferences.server"
import { json, LinksFunction, LoaderFunctionArgs, MetaFunction, SerializeFrom } from "~/lib/vendor/vercel.server"

export const meta: MetaFunction = () => {
  return [{ title: "Ramble" }, { name: "description", content: "Created by No Quarter" }]
}

export const links: LinksFunction = () => {
  return cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie")

  const { flashSession, themeSession, user, preferences } = await promiseHash({
    flashSession: getFlashSession(request),
    themeSession: getThemeSession(request),
    user: getMaybeUser(request),
    preferences: preferencesCookies.parse(cookieHeader) as Promise<Preferences>,
  })
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken()

  return json(
    {
      user,
      csrf: csrfToken,
      flash: flashSession.message,
      preferences: preferences || defaultPreferences,
      theme: themeSession.theme,
      config: { WEB_URL: FULL_WEB_URL },
    },
    {
      headers: [
        ["set-cookie", csrfCookieHeader || ""],
        ["set-cookie", await flashSession.commit()],
        ["set-cookie", await themeSession.commit()],
      ],
    },
  )
}

export const shouldRevalidate: ShouldRevalidateFunction = (args) => {
  return args.formMethod === "POST"
}

export type RootLoader = SerializeFrom<typeof loader>

export default function App() {
  const { csrf, flash, theme } = useLoaderData<typeof loader>()
  const transition = useNavigation()
  const fetchers = useFetchers()
  const state = React.useMemo<"idle" | "loading">(() => {
    const states = [transition.state, ...fetchers.map((fetcher) => fetcher.state)]
    if (states.every((state) => state === "idle")) return "idle"
    return "loading"
  }, [transition.state, fetchers])

  React.useEffect(() => {
    if (state === "loading") NProgress.start()
    if (state === "idle") NProgress.done()
  }, [transition.state, state])

  return (
    <Document theme={theme}>
      <AuthenticityTokenProvider token={csrf}>
        <Tooltip.Provider>
          <Outlet />
          <Toaster flash={flash} />
        </Tooltip.Provider>
      </AuthenticityTokenProvider>
    </Document>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  const isCatchError = isRouteErrorResponse(error)

  return (
    <Document theme="dark">
      <div className="flex items-center overflow-scroll p-20 pt-40">
        {isCatchError ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-9xl">{error.status}</h1>
              <p className="text-lg">
                {error.status === 404
                  ? "The page you're looking for doesn't exist"
                  : error.data.message || "Something's gone wrong here"}
              </p>
            </div>
            {error.status === 404 && <LinkButton to="/">Take me home</LinkButton>}
          </div>
        ) : error instanceof Error ? (
          <div className="max-w-4xl space-y-6">
            <Frown className="sq-20" />
            <h1 className="text-3xl">Oops, there was an error.</h1>
            <p>{error.message}</p>
            {error.stack && (
              <>
                <hr />
                <div className="rounded-xs bg-gray-200 p-4 dark:bg-gray-700 ">
                  <pre className="overflow-scroll text-sm">{error.stack}</pre>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <h1 className="text-6xl">Sorry, an unknown error has occured</h1>
          </div>
        )}
      </div>
    </Document>
  )
}

interface DocumentProps {
  children: React.ReactNode
  theme: Theme
}

function Document({ theme, children }: DocumentProps) {
  return (
    <html lang="en" className={join(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="msapplication-TileColor" content={theme === "dark" ? "#241c17" : "#fffefe"} />
        <meta name="theme-color" content={theme === "dark" ? "#241c17" : "#fffefe"} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <Analytics />
      </body>
    </html>
  )
}
