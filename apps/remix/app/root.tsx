import "@fontsource/urbanist/300.css"
import "@fontsource/urbanist/400.css"
import "@fontsource/urbanist/500.css"
import "@fontsource/urbanist/600.css"
import "@fontsource/urbanist/700.css"
import "@fontsource/urbanist/800.css"
import "@fontsource/urbanist/900.css"
import "~/styles/app.css"

import * as Tooltip from "@radix-ui/react-tooltip"
import { cssBundleHref } from "@remix-run/css-bundle"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useFetchers,
  useLoaderData,
  useLocation,
  useNavigation,
  useRouteError,
} from "@remix-run/react"
import { Analytics } from "@vercel/analytics/react"
import { Frown } from "lucide-react"
import NProgress from "nprogress"
import posthog from "posthog-js"
import * as React from "react"
import { AuthenticityTokenProvider } from "remix-utils/csrf/react"
import { promiseHash } from "remix-utils/promise"

import { ENV, FULL_WEB_URL } from "@ramble/server-env"
import { join } from "@ramble/shared"

import { Toaster } from "~/components/ui"
import {
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
  type SerializeFrom,
  json,
} from "~/lib/vendor/vercel.server"

import { LinkButton } from "./components/LinkButton"
import { useConfig } from "./lib/hooks/useConfig"
import { type Theme } from "./lib/theme"
import { GDPR } from "./pages/api+/gdpr"
import { getMaybeUser } from "./services/auth/auth.server"
import { csrf } from "./services/session/csrf.server"
import { getFlashSession } from "./services/session/flash.server"
import { getGdprSession } from "./services/session/gdpr.server"
import { getThemeSession } from "./services/session/theme.server"

export const meta: MetaFunction = () => {
  return [{ title: "Ramble: Van Travel App" }, { name: "description", content: "Everything you need for van life in Europe." }]
}

export const links: LinksFunction = () => {
  return cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { flashSession, gdprSession, themeSession, user } = await promiseHash({
    flashSession: getFlashSession(request),
    themeSession: getThemeSession(request),
    gdprSession: getGdprSession(request),
    user: getMaybeUser(request),
  })
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken()

  return json(
    {
      user,
      gdpr: gdprSession.gdpr,
      csrf: csrfToken,
      flash: flashSession.message,
      theme: themeSession.theme,
      config: { FULL_WEB_URL, ENV },
    },
    {
      headers: [
        ["set-cookie", csrfCookieHeader as string],
        ["set-cookie", await flashSession.commit()],
        ["set-cookie", await gdprSession.commit()],
        ["set-cookie", await themeSession.commit()],
      ],
    },
  )
}

export type RootLoader = SerializeFrom<typeof loader>

export default function App() {
  const { csrf, flash, user, config, theme, gdpr } = useLoaderData<typeof loader>()
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
  }, [state])

  const location = useLocation()
  const [isHogLoaded, setIsHogLoaded] = React.useState(false)

  React.useEffect(() => {
    if ((gdpr && !gdpr.isAnalyticsEnabled) || config.ENV !== "production") return
    if (!isHogLoaded) {
      posthog.init("phc_3HuNiIa6zCcsNHFmXst4X0HJjOLq32yRyRPVZQhsD31", {
        api_host: "https://eu.posthog.com",
        loaded: () => setIsHogLoaded(true),
      })
    }
    if (user) {
      posthog.identify(user.id, { email: user.email, firstName: user.firstName, lastName: user.lastName })
    }
  }, [gdpr, user, config, isHogLoaded])

  React.useEffect(() => {
    if (!isHogLoaded || !location.pathname) return
    posthog.capture("$pageview")
  }, [location.pathname, isHogLoaded])

  return (
    <Document theme={theme}>
      <AuthenticityTokenProvider token={csrf}>
        <Tooltip.Provider>
          <Outlet />
          <Toaster flash={flash} />
          <GDPR />
        </Tooltip.Provider>
      </AuthenticityTokenProvider>
    </Document>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  const isCatchError = isRouteErrorResponse(error)
  const config = useConfig()

  return (
    <Document theme="dark">
      <h1 className="brand-header p-6 text-3xl">ramble</h1>
      <div className="flex flex-col overflow-scroll px-32 pt-40">
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
            <h1 className="text-3xl">Oops, there was an error!</h1>
            <p>{error.message}</p>
            {config && config.ENV !== "production" && error.stack ? (
              <>
                <hr />
                <div className="rounded-xs bg-gray-200 p-4 dark:bg-gray-700 ">
                  <pre className="overflow-scroll text-sm">{error.stack}</pre>
                </div>
              </>
            ) : (
              <>
                <hr />
                <p>We have been notified and will fix the issue as soon as possible.</p>
              </>
            )}
          </div>
        ) : (
          <div>
            <h1 className="text-6xl">Sorry, an unknown error has occured!</h1>
            <hr />
            <p>We have been notified and will fix the issue as soon as possible.</p>
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
        <meta name="apple-itunes-app" content="app-id=6468265289" />
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
