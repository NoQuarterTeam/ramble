import { merge } from "@ramble/shared"

export function Skeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={merge("rounded-xs animate-pulse bg-gray-100 dark:bg-gray-700", props.className)} />
}
