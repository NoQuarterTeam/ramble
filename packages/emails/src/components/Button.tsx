import { merge } from "@ramble/shared"
import { Button as RButton } from "@react-email/components"

interface Props {
  href: string
  children: string
  className?: string
}

export function Button(props: Props) {
  return (
    <RButton href={props.href} className={merge("rounded-xs bg-white px-3 py-3 text-black", props.className)}>
      {props.children}
    </RButton>
  )
}
