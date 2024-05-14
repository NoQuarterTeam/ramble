import * as Sentry from "@sentry/nextjs"

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      enabled: process.env.NODE_ENV === "production",
      dsn: "https://d919f8332860181a789a4ba50a3790d1@o204549.ingest.us.sentry.io/4506181102403584",
      tracesSampleRate: 1,
      debug: false,
    })
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      enabled: process.env.NODE_ENV === "production",
      dsn: "https://d919f8332860181a789a4ba50a3790d1@o204549.ingest.us.sentry.io/4506181102403584",
      tracesSampleRate: 1,
      debug: false,
    })
  }
}
