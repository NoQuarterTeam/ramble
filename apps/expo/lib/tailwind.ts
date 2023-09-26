import { useColorScheme } from "react-native"
import resolveConfig from "tailwindcss/resolveConfig"

import tailwindConfig from "../tailwind.config"

const { theme } = resolveConfig(tailwindConfig)

export const backgroundDark = (theme?.colors?.["background-dark"] as string) || "black"
export const backgroundLight = (theme?.colors?.["background"] as string) || "white"

export { theme }

export function useBackgroundColor() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  return isDark ? backgroundDark : backgroundLight
}
