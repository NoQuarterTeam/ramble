import type { LucideIcon, LucideProps } from "lucide-react"

export type RambleIcon = LucideIcon | ((props: LucideProps) => JSX.Element)

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}
export const Icons = {
  Timer: ({ strokeWidth = 2, size = 24, color = "currentColor", ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10 2H14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 13L14 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Bbq: ({ strokeWidth = 2, size = 24, color = "currentColor", ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M18 18C16.8954 18 16 18.8954 16 20C16 21.1046 16.8954 22 18 22C19.1046 22 20 21.1046 20 20C20 18.8954 19.1046 18 18 18ZM18 18L6 18M18 18L17 14M7 14L5 22M8 6C7.09 4.42383 8.89205 3.54508 7.98205 1.96891M12 6C11.09 4.42383 12.8921 3.54508 11.9821 1.96891M16 6C15.09 4.42383 16.8921 3.54508 15.9821 1.96891M5 9C5 9 5 15 12 15C19 15 19 9 19 9L5 9Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
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
  Surf2: ({ strokeWidth = 2, size = 24, color = "currentColor", ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M21.5 12C19 12 18.5 13.5 16 13.5C14.5 13.5 13.2294 12.7572 12.5 12C11.5 10.9618 11.1695 10.0761 12 8C12.7227 6.1933 15.5 5.5 16 7.5C17.5 6.5 18 5.07721 16.5 3.5C15 1.92278 12.5 2 10.5 3C7.32131 4.98668 6.35288 8.23638 5.58737 10.7417C5.24354 11.867 4.35623 12.7146 3.24001 13.0867L2 13.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17C2.6 17.5 3.2 18 4.5 18C7 18 7 16 9.5 16C12.1 16 11.9 18 14.5 18C17 18 17 16 19.5 16C20.8 16 21.4 16.5 22 17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 21C2.6 21.5 3.2 22 4.5 22C7 22 7 20 9.5 20C12.1 20 11.9 22 14.5 22C17 22 17 20 19.5 20C20.8 20 21.4 20.5 22 21"
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
        d="M17.6471 15.9467C18.9466 15.9467 20 13.2723 20 9.97333C20 6.67435 18.9466 4 17.6471 4M17.6471 15.9467C16.3476 15.9467 15.5 13.299 15.5 10M17.6471 15.9467L15.5 16M15.5 10C15.5 6.70102 16.3476 4 17.6471 4M15.5 10V20H4V9.97333C4 6.67435 5.05345 4 6.35294 4H17.6471"
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
  Sup: ({ strokeWidth = 2, size = 24, color = "currentColor", ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M14.2857 22L13.3066 19.0013C12.8179 17.5049 12.4932 15.9598 12.3382 14.3932C12.1139 12.1262 12.2173 9.83876 12.6453 7.60128L12.7725 6.93606C13.0177 5.65419 13.4733 4.42171 14.1208 3.28855L14.333 2.9172C15.0701 1.62736 16.9299 1.62736 17.667 2.9172L17.8792 3.28855C18.5267 4.42171 18.9823 5.65419 19.2275 6.93607L19.3547 7.60129C19.7827 9.83876 19.8861 12.1262 19.6618 14.3932C19.5068 15.9598 19.1821 17.5049 18.6934 19.0013L17.7143 22H14.2857Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 16V19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6 3V14M4 3H8M6 13.5L4.39527 16.3083C4.13625 16.7616 4 17.2746 4 17.7967V21H8V17.7967C8 17.2746 7.86375 16.7616 7.60473 16.3083L6 13.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}
