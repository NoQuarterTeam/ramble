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
  Sauna: ({ strokeWidth = 2, size = 24, color = "currentColor", ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7 18C7 16.336 9 16.464 9 14.8C9 13.2 7 13.2 7 11.6C7 10.768 7.5 10.384 8 10M11 18C11 16.336 13 16.464 13 14.8C13 13.2 11 13.2 11 11.6C11 10.768 11.5 10.384 12 10M15 18C15 16.336 17 16.464 17 14.8C17 13.2 15 13.2 15 11.6C15 10.768 15.5 10.384 16 10M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Pool: ({ strokeWidth = 2, size = 24, color = "currentColor", ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M2 19C2.6 19.5 3.2 20 4.5 20C7 20 7 18 9.5 18C12.1 18 11.9 20 14.5 20C17 20 17 18 19.5 18C20.8 18 21.4 18.5 22 19"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 15V13M6 13H15M6 13V9.1875M10 6V5C10 3.89543 9.10457 3 8 3C6.89543 3 6 3.89543 6 5V9.1875M6 9.1875H15M15 15V5C15 3.89543 15.8954 3 17 3C18.1046 3 19 3.89543 19 5V6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}
