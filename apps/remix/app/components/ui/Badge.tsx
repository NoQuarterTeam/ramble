import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { merge } from "@ramble/shared"

export const badgeProps = cva("w-min rounded-md font-medium uppercase", {
  variants: {
    colorScheme: {
      orange: "dark:color-orange-200 bg-orange-300/40 text-orange-900 dark:bg-orange-300/20 dark:text-orange-200",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
      red: "dark:color-red-200 bg-red-300/40 text-red-900 dark:bg-red-300/20 dark:text-red-200",
      green: "dark:color-green-200 bg-green-300/40 text-green-900 dark:bg-green-300/20 dark:text-green-200",
    },
    size: {
      xs: "text-xxs px-1 py-px",
      sm: "px-1 py-0.5 text-xs",
      md: "px-2 py-1 text-sm",
      lg: "text-md px-2.5 py-1",
    },
  },
  defaultVariants: {
    size: "sm",
    colorScheme: "gray",
  },
})

export type BadgeStyleProps = VariantProps<typeof badgeProps>

interface Props extends BadgeStyleProps, React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

export function Badge({ size, colorScheme, ...props }: Props) {
  return (
    <div {...props} className={merge(badgeProps({ size, colorScheme }), props.className)}>
      {props.children}
    </div>
  )
}
