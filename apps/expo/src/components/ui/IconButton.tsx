import * as React from "react"
import { TouchableOpacity, type TouchableOpacityProps, useColorScheme } from "react-native"

import { merge } from "@ramble/shared"

import { Spinner } from "./Spinner"

import { type VariantProps, cva } from "class-variance-authority"
import { Icon, type IconProps } from "../Icon"
import type { RambleIcon } from "./Icons"

export const iconButtonStyles = cva("rounded-full flex flex-row items-center justify-center border", {
  variants: {
    size: {
      xs: "sq-8",
      sm: "sq-10",
      md: "sq-12",
      lg: "sq-14",
    },
    variant: {
      primary: "border-transparent bg-gray-900 dark:bg-white",
      secondary: "border-transparent bg-gray-100 dark:bg-gray-800",
      destructive: "border-transparent bg-red-500",
      outline: "border-gray-200 dark:border-gray-700",
      ghost: "border-transparent",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
})

export type IconButtonStyleProps = VariantProps<typeof iconButtonStyles>
export interface IconButtonProps extends TouchableOpacityProps, IconButtonStyleProps {
  className?: string
  isLoading?: boolean
  iconProps?: Omit<IconProps, "icon">
  icon: RambleIcon
}

export const IconButton = React.forwardRef(function _Button(
  { variant = "primary", icon, iconProps, size = "md", isLoading, ...props }: IconButtonProps,
  ref,
) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  return (
    <TouchableOpacity
      ref={ref as React.RefObject<TouchableOpacity>}
      {...props}
      disabled={props.disabled || isLoading}
      activeOpacity={0.7}
      className={merge(iconButtonStyles({ variant, size }), (isLoading || props.disabled) && "opacity-50", props.className)}
    >
      <Icon
        size={18}
        color={{
          light: variant === "primary" || variant === "destructive" ? "white" : "black",
          dark: variant === "primary" || variant === "destructive" ? "black" : "white",
        }}
        {...iconProps}
        icon={icon}
        className={merge(iconProps?.className, isLoading && "opacity-0")}
      />

      {isLoading && (
        <Spinner
          size="small"
          className="absolute"
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
      )}
    </TouchableOpacity>
  )
})
