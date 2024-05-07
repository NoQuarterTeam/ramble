import { merge } from "@ramble/shared"

type DivProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export function Tile({ children, ...props }: DivProps) {
  return (
    <div {...props} className={merge("w-full rounded-xs border", props.className)}>
      {children}
    </div>
  )
}

export function TileHeader({ children, ...props }: DivProps) {
  return (
    <div {...props} className={merge("flex w-full items-center justify-between px-4 pt-4 pb-0 md:px-6", props.className)}>
      {children}
    </div>
  )
}
export function TileHeading({
  children,
  ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>) {
  return (
    <p {...props} className={merge("font-semibold text-lg", props.className)}>
      {children}
    </p>
  )
}
export function TileBody({ children, ...props }: DivProps) {
  return (
    <div {...props} className={merge("w-full px-4 py-4 md:px-6", props.className)}>
      {children}
    </div>
  )
}

export function TileFooter({ children, ...props }: DivProps) {
  return (
    <div {...props} className={merge("w-full rounded-b-md border-t px-4 py-4 text-gray-400 text-sm md:px-6", props.className)}>
      {children}
    </div>
  )
}
