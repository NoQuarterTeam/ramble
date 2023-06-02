import { Text as RText, type TextProps } from "react-native"

import { merge } from "@ramble/shared"

export function Heading(props: TextProps) {
  return (
    <RText {...props} className={merge("font-500 dark:text-white", props.className)}>
      {props.children}
    </RText>
  )
}
