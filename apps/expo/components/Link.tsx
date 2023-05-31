import { type TextProps } from "react-native"
import { Link as ELink } from "expo-router"
import { merge } from "@ramble/shared"

export function Link(props: TextProps & { className?: string; href: string }) {
  return (
    <ELink {...props} className={merge("font-body dark:text-white", props.className)}>
      {props.children}
    </ELink>
  )
}
