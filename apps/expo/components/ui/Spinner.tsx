import { type ActivityIndicatorProps } from "react-native"
import { ActivityIndicator, useColorScheme } from "react-native"

export function Spinner({ color, ...props }: ActivityIndicatorProps) {
  const colorScheme = useColorScheme()

  return <ActivityIndicator {...props} color={color || (colorScheme === "dark" ? "white" : "black")} />
}
