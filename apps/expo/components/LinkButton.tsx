import { Button, ButtonProps } from "./Button"
import { Link } from "./Link"

interface Props extends ButtonProps {
  href: string
}

export function LinkButton({ href, ...props }: Props) {
  return (
    <Link asChild href={href}>
      <Button {...props}>{props.children}</Button>
    </Link>
  )
}
