import { Text as RText, type TextProps } from "react-native"

import { merge } from "@ramble/shared"

export function Text(props: TextProps) {
  return (
    <RText {...props} className={merge("font-400 text-base dark:text-white", props.className)}>
      {props.children}
    </RText>
  )
}
