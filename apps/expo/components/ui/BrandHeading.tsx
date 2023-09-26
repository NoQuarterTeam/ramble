import { Text as RText, type TextProps } from "react-native"

import { merge } from "@ramble/shared"

export function BrandHeading(props: TextProps) {
  return (
    <RText {...props} className={merge("font-urbanist text-primary text-xl", props.className)}>
      {props.children}
    </RText>
  )
}
