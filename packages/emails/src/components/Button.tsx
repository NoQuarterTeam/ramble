import { Button as RButton } from "@react-email/components"

interface Props {
  href: string
  children: string
}

export function Button(props: Props) {
  return (
    <RButton href={props.href} className="rounded-xs bg-white px-3 py-3 text-black">
      {props.children}
    </RButton>
  )
}
