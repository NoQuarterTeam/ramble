import { Path, Svg } from "react-native-svg"

// copy from web icons
export interface IconProps {
  size?: number | string
  color?: string
  fill?: string
  strokeWidth?: number | string
  className?: string
}
export const Icons = {
  Surf: ({ strokeWidth = 2, size = 24, color = "currentColor", fill = "none", ...props }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} {...props}>
      <Path
        d="M7 17L9 15M4 20L2 19L2.53519 17.9296C4.16772 14.6646 6.31595 11.684 8.89721 9.10279L9.6133 8.3867C10.536 7.464 11.5376 6.6237 12.6066 5.87539C14.8498 4.30511 17.362 3.15949 20.0185 2.49537L22 2L21.6969 3.21231C20.9057 6.37727 19.5408 9.37031 17.6699 12.0429C17.2242 12.6798 16.7236 13.2764 16.1739 13.8261L15.5899 14.4101C12.5499 17.4501 9.03958 19.9802 5.19418 21.9029L5 22L4 20Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  ),
  Van: ({ strokeWidth = 2, size = 24, color = "currentColor", ...props }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M15 16L9 16M20 16L22 16V13C22.0007 12.762 21.9165 12.3816 21.7625 12.2001C21.6085 12.0186 21.2349 12.0381 21 12L20.25 9.49998L19.875 8.24996L19.7138 7.71264C19.5869 7.28966 19.1976 7 18.756 7H18L11.25 6.99995H3.87679C3.37504 6.99995 2.95097 7.37177 2.88537 7.86922L2.64 9.72995C2.22015 10.5646 2.00099 11.4857 2 12.42V16H4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5 19C7.88071 19 9 17.8807 9 16.5C9 15.1193 7.88071 14 6.5 14C5.11929 14 4 15.1193 4 16.5C4 17.8807 5.11929 19 6.5 19Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.5 19C18.8807 19 20 17.8807 20 16.5C20 15.1193 18.8807 14 17.5 14C16.1193 14 15 15.1193 15 16.5C15 17.8807 16.1193 19 17.5 19Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M5 4L17 4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
}
