import * as React from "react"
import { TouchableOpacity, type TouchableOpacityProps, useColorScheme } from "react-native"
import { cva, type VariantProps } from "class-variance-authority"

import { merge } from "@ramble/shared"

import { Spinner } from "./Spinner"
import { Text } from "./Text"

export const buttonStyles = cva("flex items-center justify-center rounded-md border", {
  variants: {
    size: {
      xs: "h-8 px-2",
      sm: "h-10 px-3",
      md: "h-12 px-4",
      lg: "h-14 px-5",
    },
    variant: {
      primary: "border-transparent bg-gray-900 dark:bg-white",
      secondary: "border-transparent bg-gray-100 dark:bg-gray-800",
      destructive: "border-transparent bg-red-500",
      outline: "border-gray-200 dark:border-gray-700",
      ghost: "border-transparent",
      link: "border-transparent",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})
export const buttonTextStyles = cva("text-center font-500 text-md", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
    variant: {
      primary: "text-white dark:text-black",
      secondary: "text-black dark:text-white",
      destructive: "text-white",
      outline: "",
      ghost: "",
      link: "underline",
    },
  },
})
export type ButtonStyleProps = VariantProps<typeof buttonStyles>

export interface ButtonProps extends TouchableOpacityProps, ButtonStyleProps {
  className?: string
  textClassName?: string
  children: React.ReactNode
  isLoading?: boolean
  leftIcon?: React.ReactNode
}

export const Button = React.forwardRef(function _Button(
  { variant = "primary", leftIcon, size = "md", isLoading, ...props }: ButtonProps,
  ref,
) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  return (
    <TouchableOpacity
      ref={ref as React.LegacyRef<TouchableOpacity>}
      {...props}
      disabled={props.disabled || isLoading}
      activeOpacity={0.7}
      className={merge(
        buttonStyles({ variant, size }),
        (props.disabled || isLoading) && "opacity-70",
        "flex flex-row items-center justify-center",
        props.className,
        size === "sm" || size === "xs" ? "space-x-1" : "space-x-2",
      )}
    >
      {isLoading ? (
        <Spinner
          size={size === "md" ? 20 : size === "lg" ? 25 : 15}
          color={
            variant === "primary"
              ? isDark
                ? "black"
                : "white"
              : variant === "destructive"
              ? "white"
              : isDark
              ? "white"
              : "black"
          }
        />
      ) : (
        <>
          {leftIcon}
          <Text className={buttonTextStyles({ variant, size, className: props.textClassName })}>{props.children}</Text>
        </>
      )}
    </TouchableOpacity>
  )
})
