import { merge } from "@ramble/shared"
import { Link as RLink } from "@react-email/components"

interface Props {
  href: string
  children: string
  className?: string
}

export function Link(props: Props) {
  return (
    <RLink href={props.href} className={merge("block text-orange-700 underline", props.className)}>
      {props.children}
    </RLink>
  )
}
