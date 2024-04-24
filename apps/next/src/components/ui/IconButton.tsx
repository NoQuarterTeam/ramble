"use client"
import { type VariantProps, cva } from "class-variance-authority"
import * as React from "react"

import { merge } from "@ramble/shared"

import { type ButtonProps, buttonStyles } from "./Button"
import { Spinner } from "./Spinner"

export const iconbuttonStyles = cva("px-0 flex items-center justify-center", {
  variants: {
    size: {
      xs: "h-7 w-7",
      sm: "h-8 w-8",
      md: "h-9 w-9",
      lg: "h-11 w-11",
    },
  },
  defaultVariants: {
    size: "md",
  },
})
export type IconButtonStyleProps = VariantProps<typeof iconbuttonStyles>

export type IconButtonProps = IconButtonStyleProps & ButtonProps & { icon: React.ReactNode; "aria-label": string }

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function _IconButton(
  { variant = "secondary", size, isLoading, disabled, icon, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || isLoading}
      {...props}
      className={merge(
        buttonStyles({ size, disabled: disabled || isLoading, variant }),
        iconbuttonStyles({ size }),
        props.className,
      )}
    >
      <div className="flex items-center justify-center h-full w-full">{isLoading ? <Spinner size="xs" /> : icon}</div>
    </button>
  )
})
