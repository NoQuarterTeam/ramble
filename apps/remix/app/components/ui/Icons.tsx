import type { LucideIcon, LucideProps } from "lucide-react"

export type RambleIcon = LucideIcon | ((props: LucideProps) => JSX.Element)

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}
export const Icons = {
  Surf: ({ strokeWidth = 2, size = 24, color = "currentColor", ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7 17L9 15M4 20L2 19L2.53519 17.9296C4.16772 14.6646 6.31595 11.684 8.89721 9.10279L9.6133 8.3867C10.536 7.464 11.5376 6.6237 12.6066 5.87539C14.8498 4.30511 17.362 3.15949 20.0185 2.49537L22 2L21.6969 3.21231C20.9057 6.37727 19.5408 9.37031 17.6699 12.0429C17.2242 12.6798 16.7236 13.2764 16.1739 13.8261L15.5899 14.4101C12.5499 17.4501 9.03958 19.9802 5.19418 21.9029L5 22L4 20Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Van: ({ strokeWidth = 2, size = 24, color = "currentColor", ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M15 16.5L9 16.5M20 16.5L22 16.5V13.5C22.0007 13.2621 21.9165 12.8816 21.7625 12.7001C21.6085 12.5187 21.2349 12.5381 21 12.5L19.7138 8.21269C19.5869 7.78971 19.1976 7.50005 18.756 7.50005L3.87679 7.5C3.37504 7.5 2.95097 7.87182 2.88537 8.36926L2.64 10.23C2.22015 11.0646 2.00099 11.9857 2 12.92V16.5H4M5 4.5L17 4.5M9 17C9 18.3807 7.88071 19.5 6.5 19.5C5.11929 19.5 4 18.3807 4 17C4 15.6193 5.11929 14.5 6.5 14.5C7.88071 14.5 9 15.6193 9 17ZM20 17C20 18.3807 18.8807 19.5 17.5 19.5C16.1193 19.5 15 18.3807 15 17C15 15.6193 16.1193 14.5 17.5 14.5C18.8807 14.5 20 15.6193 20 17Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Toilet: ({ strokeWidth = 2, size = 24, color = "currentColor", ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M17.6471 16.2C18.9466 16.2 20 13.6928 20 10.6C20 7.50721 18.9466 5 17.6471 5M17.6471 16.2C16.3476 16.2 15.2941 13.6928 15.2941 10.6M17.6471 16.2H15.2941M15.2941 10.6C15.2941 7.50721 16.3476 5 17.6471 5M15.2941 10.6V19H4V10.6C4 7.50721 5.05345 5 6.35294 5H17.6471"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}
