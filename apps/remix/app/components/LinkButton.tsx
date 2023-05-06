import * as React from "react"
import { Link, type LinkProps } from "@remix-run/react"

import { join, merge } from "@travel/shared"
import { buttonSizeStyles, type ButtonStyleProps, buttonStyles, Spinner } from "@travel/ui"

interface LinkButtonProps extends ButtonStyleProps, LinkProps {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(function _LinkButton(
  { variant = "primary", size, isLoading, leftIcon, rightIcon, disabled, ...props },
  ref,
) {
  return (
    <Link
      ref={ref}
      style={{ pointerEvents: disabled ? "none" : undefined }}
      {...props}
      className={merge(
        buttonStyles({ size, variant, disabled }),
        buttonSizeStyles({ size }),
        props.className,
        disabled && "cursor-not-allowed",
      )}
    >
      <div className={join("center", isLoading && "opacity-0")} aria-hidden={isLoading}>
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {props.children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </div>
      {isLoading && (
        <div className="center absolute inset-0">
          <Spinner size="sm" color={variant === "primary" || variant === "destructive" ? "white" : "black"} />
        </div>
      )}
    </Link>
  )
})
