"use client"
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { IconButton } from "@travel/ui"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <IconButton
      rounded="full"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="submit"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      variant="ghost"
      icon={isDark ? <Sun className="sq-4" /> : <Moon className="sq-4" />}
    />
  )
}
