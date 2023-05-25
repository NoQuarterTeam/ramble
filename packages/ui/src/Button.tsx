"use client"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import * as React from "react"

import { merge } from "@ramble/shared"

import { Spinner } from "./Spinner"

export const buttonStyles = cva(
  "outline-none w-min focus:outline-none whitespace-nowrap font-normal rounded-md focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-gray-500 dark:focus:ring-offset-gray-900 flex center border border-transparent transition-colors duration-200",
  {
    variants: {
      size: {
        xs: "text-xxs px-2",
        sm: "text-xs px-2",
        md: "text-sm px-3",
        lg: "text-md px-5",
      },
      variant: {
        primary:
          "border-transparent text-white dark:text-black bg-gray-900 hover:bg-gray-600 active:bg-gray-500 dark:bg-white dark:hover:bg-white/90 dark:active:bg-white/80",
        secondary:
          "border-transparent text-black dark:text-white bg-black/5 hover:bg-black/10 active:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 dark:active:bg-white/30",
        destructive: "border-transparent text-white bg-red-500 hover:bg-red-600 active:bg-red-700",
        outline: "border-black/10 dark:border-white/10",
        ghost: "",
        link: "hover:underline",
      },
      disabled: {
        true: "relative opacity-70 pointer-events-none",
      },
    },
    compoundVariants: [
      {
        variant: ["ghost", "outline"],
        className:
          "text-black dark:text-white bg-transparent hover:bg-black/10 active:bg-black/20 dark:hover:bg-white/10 dark:active:bg-white/20",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
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
    rightIcon?: React.ReactNode
  }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function _Button(
  { variant = "primary", leftIcon, rightIcon, disabled, isLoading, size, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={isLoading || !!disabled}
      {...props}
      className={merge(
        (isLoading || disabled) && "cursor-not-allowed",
        buttonStyles({
          size,
          disabled: disabled || isLoading,
          variant,
        }),
        buttonSizeStyles({ size }),
        props.className,
      )}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex w-full items-center justify-center">
          <Spinner size="sm" color={variant === "primary" || variant === "destructive" ? "white" : "black"} />
        </div>
      ) : (
        <>
          {leftIcon && <span className="mr-1.5">{leftIcon}</span>}
          {props.children}
          {rightIcon && <span className="ml-1.5">{rightIcon}</span>}
        </>
      )}
    </button>
  )
})
