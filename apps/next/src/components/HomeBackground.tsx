"use client"
import * as React from "react"
import { useTheme } from "next-themes"

export function HomeBackground() {
  const { theme } = useTheme()

  return (
    <div
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 65 65' width='60' height='60' fill='none' stroke='${
          theme === "dark" ? "rgb(50 50 50 / 0.2)" : "rgb(15 23 42 / 0.03)"
        }'%3e%3cpath d='M0 .5H63.5V65'/%3e%3c/svg%3e")`,
      }}
      className="absolute inset-0 z-[-10]"
    />
  )
}
