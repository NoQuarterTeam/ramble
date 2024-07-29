"use client"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  posthog.init("phc_3HuNiIa6zCcsNHFmXst4X0HJjOLq32yRyRPVZQhsD31", {
    api_host: "https://eu.posthog.com",
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    capture_pageleave: true,
  })
}

export function PosthogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
