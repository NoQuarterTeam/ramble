import { merge } from "@ramble/shared"
import { Button as RButton } from "@react-email/components"

interface Props {
  href: string
  children: string
  className?: string
}

export function Button(props: Props) {
  return (
    <RButton
      href={props.href}
      className={merge("rounded-xs border border-solid border-gray-700 bg-black px-3 py-3 text-white", props.className)}
    >
      {props.children}
    </RButton>
  )
}
