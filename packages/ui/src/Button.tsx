"use client"
import * as React from "react"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

import { join, merge } from "@travel/shared"

import { Spinner } from "./Spinner"

export const buttonStyles = cva(
  "outline-none focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-900 flex center border border-transparent transition-colors duration-200",
  {
    variants: {
      size: {
        xs: "text-xxs px-2",
        sm: "text-xs px-2",
        md: "text-sm px-3",
        lg: "text-md px-5",
      },
      variant: {
        solid: "border-transparent font-medium",
        outline: "bg-transparent font-normal",
        ghost: "bg-transparent border-transparent font-normal",
      },
      colorScheme: {
        gray: "text-black dark:text-white",
        primary: "text-white",
        red: "text-white",
      },
      disabled: {
        true: "relative opacity-70 pointer-events-none",
      },
      rounded: {
        xs: "rounded-xs",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    compoundVariants: [
      // GRAY
      {
        colorScheme: "gray",
        variant: ["solid"],
        className:
          "bg-black/10 hover:bg-black/20 active:bg-black/30 dark:bg-white/10 dark:hover:bg-white/20 dark:active:bg-white/30",
      },
      {
        colorScheme: "gray",
        variant: ["ghost", "outline"],
        className: "hover:bg-black/10 active:bg-black/20 dark:hover:bg-white/10 dark:active:bg-white/20",
      },
      {
        colorScheme: "gray",
        variant: ["outline"],
        className: "border-black/10 dark:border-white/10",
      },
      // PINK
      {
        colorScheme: ["primary"],
        variant: ["solid"],
        className: "bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white",
      },
      {
        colorScheme: "primary",
        variant: ["ghost", "outline"],
        className: "hover:bg-primary-500/10 active:bg-primary-500/20 text-primary-500",
      },
      {
        colorScheme: "primary",
        variant: ["outline"],
        className: "border-primary-500/40 text-primary-500",
      },
      // RED
      {
        colorScheme: ["red"],
        variant: ["solid"],
        className: "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white",
      },
      {
        colorScheme: "red",
        variant: ["ghost", "outline"],
        className: "hover:bg-red-500/10 active:bg-red-500/20 text-red-500",
      },
      {
        colorScheme: "red",
        variant: ["outline"],
        className: "border-red-500/40 text-red-500",
      },
    ],
    defaultVariants: {
      variant: "solid",
      rounded: "sm",
      size: "md",
      colorScheme: "gray",
    },
  },
)

export const buttonSizeStyles = cva("", {
  variants: {
    size: {
      xs: "h-7",
      sm: "h-8",
      md: "h-9",
      lg: "h-11",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export type ButtonStyleProps = VariantProps<typeof buttonStyles>

export type ButtonProps = ButtonStyleProps &
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    isLoading?: boolean
    leftIcon?: React.ReactNode
  }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function _Button(
  { variant, leftIcon, rounded, disabled, isLoading, colorScheme, size, ...props },
  ref,
) {
  return (
    <div className={isLoading || disabled ? "cursor-not-allowed" : undefined}>
      <button
        ref={ref}
        type="button"
        disabled={isLoading || !!disabled}
        {...props}
        className={merge(
          buttonStyles({
            size,
            rounded,
            colorScheme,
            disabled: disabled || isLoading,
            variant,
          }),
          buttonSizeStyles({ size }),
          props.className,
        )}
      >
        <div className={join("center", isLoading && "opacity-0")} aria-hidden={isLoading}>
          {leftIcon && <span className="mr-0 md:mr-1">{leftIcon}</span>}
          {props.children}
        </div>
        {isLoading && (
          <div className="center absolute inset-0">
            <Spinner size={size} />
          </div>
        )}
      </button>
    </div>
  )
})
