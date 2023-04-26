import { Text as RText, type TextProps } from "react-native"

import { merge } from "@travel/shared"

export function Heading(props: TextProps) {
  return (
    <RText {...props} className={merge("font-heading dark:text-white", props.className)}>
      {props.children}
    </RText>
  )
}
