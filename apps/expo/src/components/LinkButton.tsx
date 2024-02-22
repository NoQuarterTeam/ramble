import { type AllRoutes, Link, type LinkProps } from "expo-router"

import { Button, type ButtonProps } from "./ui/Button"

type Props = ButtonProps & LinkProps<AllRoutes>

export function LinkButton({ href, push = true, ...props }: Props) {
  return (
    <Link href={href} push={push} asChild>
      <Button {...props} />
    </Link>
  )
}
